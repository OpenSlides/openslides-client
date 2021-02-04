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

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { MotionAction } from 'app/core/actions/motion-action';
import { NotifyService } from 'app/core/core-services/notify.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import {
    GET_POSSIBLE_RECOMMENDATIONS,
    MotionRepositoryService
} from 'app/core/repositories/motions/motion-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DiffLinesInParagraph, LineRange } from 'app/core/ui-services/diff.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { SPEAKER_BUTTON_FOLLOW } from 'app/shared/components/speaker-button/speaker-button.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { MotionEditNotification } from 'app/site/motions/motion-edit-notification';
import { ChangeRecoMode, LineNumberingMode, MotionEditNotificationType } from 'app/site/motions/motions.constants';
import { AmendmentFilterListService } from 'app/site/motions/services/amendment-filter-list.service';
import { AmendmentSortListService } from 'app/site/motions/services/amendment-sort-list.service';
import { MotionFilterListService } from 'app/site/motions/services/motion-filter-list.service';
import { MotionPdfExportService } from 'app/site/motions/services/motion-pdf-export.service';
import { MotionSortListService } from 'app/site/motions/services/motion-sort-list.service';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { MotionContentComponent } from '../motion-content/motion-content.component';

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
     * Toggle to expand/hide the motion log.
     */
    public motionLogExpanded = false;

    /**
     * Sets the motions, e.g. via an autoupdate. Reload important things here:
     * - Reload the recommendation. Not changed with autoupdates, but if the motion is loaded this needs to run.
     */
    public set motion(value: ViewMotion) {
        this._motion = value;
    }

    /**
     * Returns the target motion. Might be the new one or old.
     */
    public get motion(): ViewMotion {
        return this._motion;
    }

    public get showPreamble(): boolean {
        return this.motion.showPreamble;
    }

    /**
     * Saves the target motion. Accessed via the getter and setter.
     */
    private _motion: ViewMotion;

    /**
     * Value of the config variable `motions_statutes_enabled` - are statutes enabled?
     * @TODO replace by direct access to config variable, once it's available from the templates
     */
    public statutesEnabled: boolean;

    /**
     * Value of the config variable `motions_preamble`
     */
    public preamble: string;

    /**
     * Value of the configuration variable `motions_amendments_enabled` - are amendments enabled?
     * @TODO replace by direct access to config variable, once it's available from the templates
     */
    public amendmentsEnabled: boolean;

    /**
     * All change recommendations to this motion
     */
    public changeRecommendations: ViewMotionChangeRecommendation[];

    /**
     * All amendments to this motion
     */
    public amendments: ViewMotion[];

    /**
     * The change recommendations to amendments to this motion
     */
    public amendmentChangeRecos: { [amendmentId: string]: ViewMotionChangeRecommendation[] } = {};

    /**
     * The observables for the `amendmentChangeRecos` field above.
     * Necessary to track which amendments' change recommendations we have already subscribed to.
     */
    public amendmentChangeRecoSubscriptions: { [amendmentId: string]: Subscription } = {};

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
    public motionObserver: BehaviorSubject<ViewMotion[]>;

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

    /**
     * Determine if the name of supporters are visible
     */
    public showSupporters = false;

    /**
     * If this is a paragraph-based amendment, this indicates if the non-affected paragraphs should be shown as well
     */
    public showAmendmentContext = false;

    /**
     * Show all amendments in the text, not only the ones with the apropriate state
     */
    public showAllAmendments = false;

    /**
     * For using the enum constants from the template
     */
    public ChangeRecoMode = ChangeRecoMode;

    /**
     * For using the enum constants from the template
     */
    public LineNumberingMode = LineNumberingMode;

    public commentIds: Id[] = [];

    public temporaryMotion = {};

    /**
     * Hold the subscription to the navigation.
     * This cannot go into the subscription-list, since it should
     * only get destroyed using ngOnDestroy routine and not on route changes.
     */
    private navigationSubscription: Subscription;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public vp: ViewportService,
        public operator: OperatorService,
        public perms: PermissionsService,
        private router: Router,
        private route: ActivatedRoute,
        public repo: MotionRepositoryService,
        private promptService: PromptService,
        private pdfExport: MotionPdfExportService,
        private itemRepo: AgendaItemRepositoryService,
        private motionSortService: MotionSortListService,
        private amendmentSortService: AmendmentSortListService,
        private motionFilterService: MotionFilterListService,
        private amendmentFilterService: AmendmentFilterListService,
        private cd: ChangeDetectorRef,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        super.ngOnInit();

        this.requestUpdates();
        this.registerSubjects();
        this.observeRoute();
        this.getMotionByUrl();

        // load config variables
        this.meetingSettingsService
            .get('motions_statutes_enabled')
            .subscribe(enabled => (this.statutesEnabled = enabled));
        this.meetingSettingsService.get('motions_preamble').subscribe(preamble => (this.preamble = preamble));
        this.meetingSettingsService
            .get('motions_amendments_enabled')
            .subscribe(enabled => (this.amendmentsEnabled = enabled));

        // use the filter and the search service to get the current sorting
        // TODO: the `instant` can fail, if the page reloads.
        if (this.meetingSettingsService.instant('motions_amendments_in_main_list')) {
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

        /**
         * Check for changes of the viewport subject changes
         */
        this.vp.isMobileSubject.subscribe(() => {
            this.cd.markForCheck();
        });
    }

    /**
     * Called during view destruction.
     * Sends a notification to user editors of the motion was edited
     */
    public ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        this.cd.detach();
    }

    /**
     * Observes the route for events. Calls to clean all subs if the route changes.
     * Calls the motion details from the new route
     */
    private observeRoute(): void {
        this.navigationSubscription = this.router.events.subscribe(navEvent => {
            if (navEvent instanceof NavigationEnd) {
                this.cleanSubjects();
                this.getMotionByUrl();
            }
        });
    }

    private registerSubjects(): void {
        this.motionObserver = this.repo.getViewModelListBehaviorSubject();
        // since updates are usually not commig at the same time, every change to
        // any subject has to mark the view for chekcing
        this.subscriptions.push(this.motionObserver.subscribe(() => this.cd.markForCheck()));
    }

    private requestUpdates(): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [1], // TODO
            follow: [
                {
                    idField: 'user_ids',
                    fieldset: 'shortName'
                },
                {
                    idField: 'motion_block_ids',
                    fieldset: 'title'
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
        });
    }

    /**
     * determine the motion to display using the URL
     */
    public getMotionByUrl(): void {
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

    private initNewMotion(): void {
        // new motion
        super.setTitle('New motion');
        this.newMotion = true;
        this.editMotion = true;
        const defaultMotion: any = {};
        if (this.route.snapshot.queryParams.parent) {
            const parentId = +this.route.snapshot.queryParams.parent;
            this.amendmentEdit = true;
            const parentMotion = this.repo.getViewModel(parentId);
            const defaultTitle = `${this.translate.instant('Amendment to')} ${parentMotion.numberOrTitle}`;
            defaultMotion.title = defaultTitle;
            defaultMotion.lead_motion_id = parentMotion.id;
            defaultMotion.category_id = parentMotion.category_id;
            defaultMotion.tag_ids = parentMotion.tag_ids;
            defaultMotion.block_id = parentMotion.block_id;
            const amendmentTextMode = this.meetingSettingsService.instant('motions_amendments_text_mode');
            if (amendmentTextMode === 'fulltext') {
                defaultMotion.text = parentMotion.text;
            }
        }
        this.motion = defaultMotion;
    }

    private loadMotionById(motionId: number): void {
        this.requestModels({
            viewModelCtor: ViewMotion,
            ids: [motionId],
            follow: [
                {
                    idField: 'change_recommendation_ids'
                },
                {
                    idField: 'amendment_ids',
                    follow: [
                        {
                            idField: 'lead_motion_id',
                            fieldset: 'amendment'
                        }
                    ]
                },
                {
                    idField: 'submitter_ids',
                    follow: [
                        {
                            idField: 'user_id',
                            fieldset: 'shortName'
                        }
                    ]
                },
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
                SPEAKER_BUTTON_FOLLOW
            ]
        });

        this.subscriptions.push(
            this.repo.getViewModelObservable(motionId).subscribe(motion => {
                if (motion) {
                    const title = motion.getTitle();
                    super.setTitle(title);
                    this.motion = motion;
                    this.commentIds = motion.comment_ids;
                    this.cd.markForCheck();
                }
            })
        );
    }

    /**
     * Using Shift, Alt + the arrow keys will navigate between the motions
     *
     * @param event has the key code
     */
    @HostListener('document:keydown', ['$event']) public onKeyNavigation(event: KeyboardEvent): void {
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
            const response = await this.repo.create(newMotionValues);
            this.router.navigate(['motions', response.id]);
        } catch (e) {
            this.raiseError(e);
        }
    }

    private async updateMotion(
        newMotionValues: Partial<MotionAction.UpdatePayload>,
        motion: ViewMotion
    ): Promise<void> {
        await this.repo.update(newMotionValues, motion);
    }

    /**
     * In the ui are no distinct buttons for update or create. This is decided here.
     */
    public saveMotion(event?: Partial<MotionAction.CreatePayload>): void {
        const update = event || this.temporaryMotion;
        if (this.newMotion) {
            this.createMotion(update);
        } else {
            this.updateMotion(update, this.motion);
        }
        this.leaveEditMotion();
    }

    /**
     * Trigger to delete the motion.
     */
    public async deleteMotionButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this motion?');
        const content = this.motion.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.motion);
            this.router.navigate(['../motions/']);
        }
    }

    /**
     * Goes to the amendment creation wizard. Executed via click.
     */
    public createAmendment(): void {
        const amendmentTextMode = this.meetingSettingsService.instant('motions_amendments_text_mode');
        if (amendmentTextMode === 'paragraph') {
            this.router.navigate(['create-amendment'], { relativeTo: this.route });
        } else {
            this.router.navigate(['motions', 'new-amendment'], {
                relativeTo: this.route.snapshot.params.relativeTo,
                queryParams: { parent: this.motion.id || null }
            });
        }
    }

    public enterEditMotion(): void {
        this.editMotion = true;
    }

    public leaveEditMotion(): void {
        if (this.newMotion) {
            this.router.navigate(['./motions/']);
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
        const indexOfCurrent = this.sortedMotions.findIndex(motion => {
            return motion === this.motion;
        });
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
        throw new Error('Todo');
        // this.pdfExport.exportSingleMotion(this.motion, {
        //     lnMode: this.lnMode === this.LineNumberingMode.Inside ? this.LineNumberingMode.Outside : this.lnMode,
        //     crMode: this.crMode,
        //     // export all comment fields as well as personal note
        //     comments: this.motion.usedCommentSectionIds.concat([PERSONAL_NOTE_ID])
        // });
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
        this.itemRepo.removeFromAgenda(this.motion.agenda_item).catch(this.raiseError);
    }

    /**
     * Helper function so UI elements can call to detect changes
     */
    public detectChanges(): void {
        this.cd.markForCheck();
    }
}
