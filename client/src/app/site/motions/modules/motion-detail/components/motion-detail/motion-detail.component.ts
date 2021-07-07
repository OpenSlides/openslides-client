import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { MotionAction } from 'app/core/actions/motion-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { Deferred } from 'app/core/promises/deferred';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import {
    GET_POSSIBLE_RECOMMENDATIONS,
    MotionRepositoryService,
    SUBMITTER_FOLLOW
} from 'app/core/repositories/motions/motion-repository.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import { AmendmentService } from 'app/core/ui-services/amendment.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { LineNumberingMode, PERSONAL_NOTE_ID } from 'app/site/motions/motions.constants';
import { AmendmentFilterListService } from 'app/site/motions/services/amendment-filter-list.service';
import { AmendmentSortListService } from 'app/site/motions/services/amendment-sort-list.service';
import { MotionFilterListService } from 'app/site/motions/services/motion-filter-list.service';
import { MotionPdfExportService } from 'app/site/motions/services/motion-pdf-export.service';
import { MotionSortListService } from 'app/site/motions/services/motion-sort-list.service';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { MotionContentComponent } from '../motion-content/motion-content.component';
import { MotionViewService } from '../../../services/motion-view.service';

/**
 * Component for the motion detail view
 */
@Component({
    selector: 'os-motion-detail',
    templateUrl: './motion-detail.component.html',
    styleUrls: ['./motion-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionDetailComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    @ViewChild('content', { static: true })
    public motionContent: TemplateRef<MotionContentComponent>;

    /**
     * Determine if the motion is edited
     */
    public editMotion = false;

    /**
     * Determine if the motion is a new (unsent) amendment to another motion
     */
    public amendmentEdit = false;

    /**
     * Determine if the motion is new
     */
    public newMotion = false;

    /**
     * Sets the motions, e.g. via an autoupdate. Reload important things here:
     * - Reload the recommendation. Not changed with autoupdates, but if the motion is loaded this needs to run.
     */
    public motion: ViewMotion;

    public temporaryMotion = {};

    public canSave = false;

    /**
     * preload the next motion for direct navigation
     */
    public nextMotion: ViewMotion;

    /**
     * preload the previous motion for direct navigation
     */
    public previousMotion: ViewMotion;

    /**
     * Subject for (other) motions
     */
    private motionObserver: Observable<ViewMotion[]>;

    /**
     * List of presorted motions. Filles by sort service
     * and filter service.
     * To navigate back and forth
     */
    private sortedMotions: ViewMotion[];

    /**
     * The observable for the list of motions. Set in OnInit
     */
    private sortedMotionsObservable: Observable<ViewMotion[]>;

    private parentId: Id;

    private hasModelSubscriptionInitiated = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public vp: ViewportService,
        public operator: OperatorService,
        public perms: PermissionsService,
        private router: Router,
        private route: ActivatedRoute,
        public repo: MotionRepositoryService,
        private motionService: MotionService,
        private viewService: MotionViewService,
        private promptService: PromptService,
        private itemRepo: AgendaItemRepositoryService,
        private motionSortService: MotionSortListService,
        private motionFilterService: MotionFilterListService,
        private amendmentService: AmendmentService,
        private amendmentSortService: AmendmentSortListService,
        private amendmentFilterService: AmendmentFilterListService,
        private cd: ChangeDetectorRef,
        private pdfExport: MotionPdfExportService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        super.ngOnInit();
        this.requestAdditionalModels();
        this.init();
    }

    /**
     * Called during view destruction.
     * Sends a notification to user editors of the motion was edited
     */
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy();
    }

    /**
     * In the ui are no distinct buttons for update or create. This is decided here.
     */
    public async saveMotion(event?: Partial<MotionAction.CreatePayload>): Promise<void> {
        const update = event || this.temporaryMotion;
        if (this.newMotion) {
            await this.createMotion(update);
        } else {
            await this.updateMotion(update, this.motion);
            this.leaveEditMotion();
        }
    }

    /**
     * Trigger to delete the motion.
     */
    public async deleteMotionButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this motion?');
        const content = this.motion.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.motion);
            this.router.navigate([this.activeMeetingId, 'motions']);
        }
    }

    /**
     * Goes to the amendment creation wizard. Executed via click.
     */
    public createAmendment(): void {
        const amendmentTextMode = this.meetingSettingService.instant('motions_amendments_text_mode');
        if (amendmentTextMode === 'paragraph') {
            this.router.navigate(['create-amendment'], { relativeTo: this.route });
        } else {
            this.router.navigate([this.activeMeetingId, 'motions', 'new-amendment'], {
                relativeTo: this.route.snapshot.params.relativeTo,
                queryParams: { parent: this.motion.id || null }
            });
        }
    }

    public enterEditMotion(): void {
        this.editMotion = true;
        this.showMotionEditConflictWarningIfNecessary();
    }

    public leaveEditMotion(): void {
        if (this.newMotion) {
            this.router.navigate([this.activeMeetingId, 'motions']);
        } else {
            this.editMotion = false;
        }
    }

    /**
     * Navigates the user to the given ViewMotion
     *
     * @param motion target
     */
    public navigateToMotion(motion: ViewMotion): void {
        if (motion) {
            this.router.navigate([`../${motion.id}`], { relativeTo: this.route.parent });
            // update the current motion
            this.motion = motion;
            this.setSurroundingMotions();
        }
    }

    /**
     * Sets the previous and next motion. Sorts by the current sorting as used
     * in the {@link MotionSortListService} or {@link AmendmentSortListService},
     * respectively
     */
    public setSurroundingMotions(): void {
        const indexOfCurrent = this.sortedMotions.findIndex(motion => motion === this.motion);
        if (indexOfCurrent > 0) {
            this.previousMotion = this.sortedMotions[indexOfCurrent - 1];
        } else {
            this.previousMotion = null;
        }
        if (indexOfCurrent > -1 && indexOfCurrent < this.sortedMotions.length - 1) {
            this.nextMotion = this.sortedMotions[indexOfCurrent + 1];
        } else {
            this.nextMotion = null;
        }
        this.cd.markForCheck();
    }

    /**
     * Click handler for the pdf button
     */
    public onDownloadPdf(): void {
        this.pdfExport.exportSingleMotion(this.motion, {
            lnMode:
                this.viewService.currentLineNumberingMode === LineNumberingMode.Inside
                    ? LineNumberingMode.Outside
                    : this.viewService.currentLineNumberingMode,
            crMode: this.viewService.currentChangeRecommendationMode,
            // export all comment fields as well as personal note
            comments: this.motion.usedCommentSectionIds.concat([PERSONAL_NOTE_ID])
        });
    }

    /**
     * Handler for upload errors
     *
     * @param error the error message passed by the upload component
     */
    public showUploadError(error: string): void {
        this.raiseError(error);
    }

    /**
     * Function to prevent automatically closing the window/tab,
     * if the user is editing a motion.
     *
     * @param event The event object from 'onUnbeforeUnload'.
     */
    @HostListener('window:beforeunload', ['$event'])
    public stopClosing(event: Event): void {
        if (this.editMotion) {
            event.returnValue = null;
        }
    }

    public addToAgenda(): void {
        this.itemRepo.addItemToAgenda(this.motion).catch(this.raiseError);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.motion.agenda_item_id).catch(this.raiseError);
    }

    /**
     * determine the motion to display using the URL
     */
    private getMotionByUrl(): void {
        if (this.route.snapshot.params?.id) {
            this.subscriptions.push(
                this.route.params.subscribe(routeParams => {
                    this.loadMotionById(Number(routeParams.id));
                })
            );
        } else {
            this.initNewMotion();
        }
    }

    /**
     * Observes the route for events. Calls to clean all subs if the route changes.
     * Calls the motion details from the new route
     */
    private observeRoute(): void {
        this.subscriptions.push(
            this.router.events.subscribe(navEvent => {
                if (navEvent instanceof NavigationEnd) {
                    this.onRouteHasChanged();
                }
            })
        );
    }

    private registerSubjects(): void {
        this.motionObserver = this.repo.getViewModelListObservable();
        // since updates are usually not commig at the same time, every change to
        // any subject has to mark the view for chekcing
        this.subscriptions.push(
            this.motionObserver.subscribe(() => {
                this.cd.markForCheck();
            })
        );
    }

    private requestAdditionalModels(): void {
        this.requestModels(
            {
                viewModelCtor: ViewMeeting,
                ids: [this.activeMeetingId],
                follow: [
                    {
                        idField: 'motion_ids',
                        fieldset: 'title'
                    },
                    {
                        idField: 'user_ids',
                        fieldset: 'shortName'
                    },
                    {
                        idField: 'motion_block_ids',
                        fieldset: 'title'
                    },
                    {
                        idField: 'motion_category_ids'
                    },
                    {
                        idField: 'motion_workflow_ids'
                    },
                    {
                        idField: 'mediafile_ids',
                        fieldset: 'fileSelection'
                    },
                    {
                        idField: 'tag_ids'
                    },
                    {
                        idField: 'personal_note_ids'
                    }
                ]
            },
            'motion:additional_models'
        );
    }

    private initNewMotion(): void {
        // new motion
        super.setTitle('New motion');
        this.newMotion = true;
        this.editMotion = true;
        this.motion = {} as any;
        if (this.route.snapshot.queryParams.parent) {
            this.initializeAmendment();
        }
    }

    private loadMotionById(motionId: number): void {
        if (this.hasModelSubscriptionInitiated) {
            return; // already fired!
        }
        this.hasModelSubscriptionInitiated = true;
        this.requestDetailedMotion(motionId);

        this.subscriptions.push(
            this.repo.getViewModelObservable(motionId).subscribe(motion => {
                if (motion) {
                    const title = motion.getTitle();
                    super.setTitle(title);
                    this.motion = motion;
                    this.cd.markForCheck();
                }
            })
        );
    }

    private requestDetailedMotion(motionId: Id): void {
        this.requestModels(
            {
                viewModelCtor: ViewMotion,
                ids: [motionId],
                follow: [
                    {
                        idField: 'change_recommendation_ids'
                    },
                    {
                        idField: 'lead_motion_id'
                    },
                    {
                        idField: 'amendment_ids',
                        follow: [
                            {
                                idField: 'lead_motion_id',
                                fieldset: 'amendment'
                            },
                            {
                                idField: 'state_id',
                                fieldset: 'list'
                            }
                        ]
                    },
                    SUBMITTER_FOLLOW,
                    {
                        idField: 'supporter_ids',
                        fieldset: 'shortName'
                    },
                    {
                        idField: 'state_id',
                        follow: [
                            {
                                idField: 'next_state_ids'
                            },
                            GET_POSSIBLE_RECOMMENDATIONS
                        ]
                    },
                    {
                        idField: 'origin_id',
                        fieldset: 'title',
                        follow: ['meeting_id']
                    },
                    'attachment_ids',
                    SPEAKER_BUTTON_FOLLOW
                ]
            },
            'motion:detail'
        );
    }

    /**
     * Using Shift, Alt + the arrow keys will navigate between the motions
     *
     * @param event has the key code
     */
    @HostListener('document:keydown', ['$event'])
    public onKeyNavigation(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft' && event.altKey && event.shiftKey) {
            this.navigateToMotion(this.previousMotion);
        }
        if (event.key === 'ArrowRight' && event.altKey && event.shiftKey) {
            this.navigateToMotion(this.nextMotion);
        }
    }

    /**
     * Creates a motion. Calls the "patchValues" function in the MotionObject
     */
    public async createMotion(newMotionValues: Partial<MotionAction.CreatePayload>): Promise<void> {
        try {
            let response: Identifiable;
            if (this.parentId) {
                response = await this.amendmentService.createTextBased({
                    ...newMotionValues,
                    lead_motion_id: this.parentId
                });
            } else {
                response = await this.repo.create(newMotionValues);
            }
            this.router.navigate([this.activeMeetingId, 'motions', response.id]);
        } catch (e) {
            this.raiseError(e);
        }
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionService.forwardMotionsToMeetings(this.motion);
    }

    private async updateMotion(
        newMotionValues: Partial<MotionAction.UpdatePayload>,
        motion: ViewMotion
    ): Promise<void> {
        return await this.repo.update(newMotionValues, motion);
    }

    private ensureParentIsAvailable(parentId: Id): Promise<void> {
        if (!this.repo.getViewModel(parentId)) {
            const loaded = new Deferred();
            this.requestDetailedMotion(parentId);
            this.subscriptions.push(
                this.repo.getViewModelObservable(parentId).subscribe(parent => {
                    if (parent && !loaded.wasResolved) {
                        loaded.resolve();
                    }
                })
            );
            return loaded;
        }
    }

    private async initializeAmendment(): Promise<void> {
        const motion: any = {};
        this.parentId = +this.route.snapshot.queryParams.parent;
        this.amendmentEdit = true;
        await this.ensureParentIsAvailable(this.parentId);
        const parentMotion = this.repo.getViewModel(this.parentId);
        motion.lead_motion_id = this.parentId;
        const defaultTitle = `${this.translate.instant('Amendment to')} ${parentMotion.numberOrTitle}`;
        motion.title = defaultTitle;
        motion.category_id = parentMotion.category_id;
        motion.tag_ids = parentMotion.tag_ids;
        motion.block_id = parentMotion.block_id;
        const amendmentTextMode = this.meetingSettingService.instant('motions_amendments_text_mode');
        if (amendmentTextMode === 'fulltext') {
            motion.text = parentMotion.text;
        }
        this.motion = motion;
    }

    /**
     * Lifecycle routine for motions to initialize.
     */
    private init(): void {
        this.cd.reattach();

        this.registerSubjects();
        this.observeRoute();
        this.getMotionByUrl();

        // use the filter and the search service to get the current sorting
        // TODO: the `instant` can fail, if the page reloads.
        if (this.meetingSettingService.instant('motions_amendments_in_main_list')) {
            this.motionFilterService.initFilters(this.motionObserver);
            this.motionSortService.initSorting(this.motionFilterService.outputObservable);
            this.sortedMotionsObservable = this.motionSortService.outputObservable;
        } else if (this.motion && this.motion.lead_motion_id) {
            // only use the amendments for this motion
            this.amendmentFilterService.initFilters(
                this.repo.getAmendmentsByMotionAsObservable(this.motion.lead_motion_id)
            );
            this.amendmentSortService.initSorting(this.amendmentFilterService.outputObservable);
            this.sortedMotionsObservable = this.amendmentSortService.outputObservable;
        } else {
            this.sortedMotions = [];
        }

        if (this.sortedMotionsObservable) {
            this.subscriptions.push(
                this.sortedMotionsObservable.subscribe(motions => {
                    if (motions) {
                        this.sortedMotions = motions;
                        this.setSurroundingMotions();
                    }
                })
            );
        }

        this.subscriptions.push(
            /**
             * Check for changes of the viewport subject changes
             */
            this.vp.isMobileSubject.subscribe(() => {
                this.cd.markForCheck();
            })
        );
    }

    private showMotionEditConflictWarningIfNecessary(): void {
        if (this.motion.amendments?.filter(amend => amend.isParagraphBasedAmendment()).length > 0) {
            const msg = this.translate.instant(
                'Warning: Amendments exist for this motion. Editing this text will likely impact them negatively. Particularily, amendments might become unusable if the paragraph they affect is deleted.'
            );
            this.raiseWarning(msg);
        }
    }

    /**
     * Lifecycle routine for motions to get destroyed.
     */
    private destroy(): void {
        this.hasModelSubscriptionInitiated = false;
        this.cleanSubjects();
        this.viewService.reset();
        this.cd.detach();
    }

    private onRouteHasChanged(): void {
        this.destroy();
        this.init();
    }
}
