import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { HasSequentialNumber } from 'src/app/domain/interfaces';
import { Motion } from 'src/app/domain/models/motions/motion';
import { LineNumberingMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AgendaItemControllerService } from '../../../../../agenda/services/agenda-item-controller.service/agenda-item-controller.service';
import { MotionForwardDialogService } from '../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { AmendmentControllerService } from '../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionPermissionService } from '../../../../services/common/motion-permission.service/motion-permission.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';
import { AmendmentListFilterService } from '../../../../services/list/amendment-list-filter.service/amendment-list-filter.service';
import { AmendmentListSortService } from '../../../../services/list/amendment-list-sort.service/amendment-list-sort.service';
import { MotionListFilterService } from '../../../../services/list/motion-list-filter.service/motion-list-filter.service';
import { MotionListSortService } from '../../../../services/list/motion-list-sort.service/motion-list-sort.service';
import { MotionDetailViewService } from '../../services/motion-detail-view.service';

@Component({
    selector: `os-motion-detail-view`,
    templateUrl: `./motion-detail-view.component.html`,
    styleUrls: [`./motion-detail-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionDetailViewComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    public readonly collection = ViewMotion.COLLECTION;

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
    public set motion(motion: ViewMotion) {
        this._motion = motion;
        if (motion) {
            this.init();
        }
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    public temporaryMotion: any = {};

    public canSave = false;

    /**
     * preload the next motion for direct navigation
     */
    public set nextMotion(motion: ViewMotion | null) {
        this._nextMotion = motion;
        this.cd.markForCheck();
    }

    public get nextMotion(): ViewMotion | null {
        return this._nextMotion;
    }

    /**
     * preload the previous motion for direct navigation
     */
    public set previousMotion(motion: ViewMotion | null) {
        this._previousMotion = motion;
        this.cd.markForCheck();
    }

    public get previousMotion(): ViewMotion | null {
        return this._previousMotion;
    }

    public get showNavigateButtons(): boolean {
        return !!this.previousMotion || !!this.nextMotion;
    }

    public hasLoaded = new BehaviorSubject(false);

    private _nextMotion: ViewMotion | null = null;

    private _previousMotion: ViewMotion | null = null;

    /**
     * Subject for (other) motions
     */
    private _motionObserver: Observable<ViewMotion[]> = of([]);

    /**
     * List of presorted motions. Filles by sort service
     * and filter service.
     * To navigate back and forth
     */
    private _sortedMotions: ViewMotion[] = [];

    /**
     * The observable for the list of motions. Set in OnInit
     */
    private _sortedMotionsObservable: Observable<ViewMotion[]> = of([]);

    private _motion: ViewMotion | null = null;
    private _motionId: Id | null = null;
    private _parentId: Id | null = null;

    private _hasModelSubscriptionInitiated = false;

    private _forwardingAvailable = false;

    private _amendmentsInMainList = false;

    public constructor(
        protected override translate: TranslateService,
        public vp: ViewPortService,
        public operator: OperatorService,
        public perms: MotionPermissionService,
        private route: ActivatedRoute,
        public repo: MotionControllerService,
        private viewService: MotionDetailViewService,
        private promptService: PromptService,
        private itemRepo: AgendaItemControllerService,
        private motionSortService: MotionListSortService,
        private motionFilterService: MotionListFilterService,
        private motionForwardingService: MotionForwardDialogService,
        private amendmentRepo: AmendmentControllerService,
        private amendmentSortService: AmendmentListSortService,
        private amendmentFilterService: AmendmentListFilterService,
        private cd: ChangeDetectorRef,
        private pdfExport: MotionPdfExportService
    ) {
        super();

        this.motionForwardingService.forwardingMeetingsAvailable().then(forwardingAvailable => {
            this._forwardingAvailable = forwardingAvailable;
        });

        this.meetingSettingsService
            .get(`motions_amendments_in_main_list`)
            .subscribe(enabled => (this._amendmentsInMainList = enabled));
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.activeMeetingIdService.meetingIdObservable.subscribe(() => {
                this.hasLoaded.next(false);
            })
        );
    }

    /**
     * Called during view destruction.
     * Sends a notification to user editors of the motion was edited
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy();
        this.amendmentSortService.exitSortService();
        this.motionSortService.exitSortService();
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.saveMotion();
    }

    public goToHistory(): void {
        this.router.navigate([this.activeMeetingId!, `history`], { queryParams: { fqid: this.motion.fqid } });
    }

    /**
     * In the ui are no distinct buttons for update or create. This is decided here.
     */
    public async saveMotion(event?: any): Promise<void> {
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
        let title = this.translate.instant(`Are you sure you want to delete this motion? `);
        let content = this.motion.getTitle();
        if (this.motion.amendments.length) {
            title = this.translate.instant(
                `Warning: Amendments exist for this motion. Are you sure you want to delete this motion regardless?`
            );
            content =
                `<i>` +
                this.translate.instant(`Motion`) +
                ` ` +
                this.motion.getTitle() +
                `</i>` +
                `<br>` +
                this.translate.instant(
                    `Deleting this motion will likely impact it's amendments negatively and they could become unusable.`
                ) +
                `<br>` +
                this.translate.instant(`List of amendments: `) +
                `<br>` +
                this.motion.amendments.map(amendment => amendment.number).join(`, `);
        }
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.motion);
            this.router.navigate([this.activeMeetingId, `motions`]);
        }
    }

    /**
     * Goes to the amendment creation wizard. Executed via click.
     */
    public createAmendment(): void {
        const amendmentTextMode = this.meetingSettingService.instant(`motions_amendments_text_mode`);
        if (amendmentTextMode === `paragraph`) {
            this.router.navigate([`create-amendment`], { relativeTo: this.route });
        } else {
            this.router.navigate([this.activeMeetingId, `motions`, `new-amendment`], {
                relativeTo: this.route.snapshot.params[`relativeTo`],
                queryParams: { parent: this.motion.id || null }
            });
        }
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionForwardingService.forwardMotionsToMeetings(this.motion);
    }

    public get showForwardButton(): boolean {
        return !!this.motion.state?.allow_motion_forwarding && this._forwardingAvailable;
    }

    public enterEditMotion(): void {
        this.editMotion = true;
        this.showMotionEditConflictWarningIfNecessary();
    }

    public leaveEditMotion(): void {
        if (this.newMotion) {
            this.router.navigate([this.activeMeetingId, `motions`]);
        } else {
            this.editMotion = false;
        }
    }

    /**
     * Navigates the user to the given ViewMotion
     *
     * @param motion target
     */
    public navigateToMotion(motion: ViewMotion | null): void {
        if (motion) {
            this.router.navigate([this.activeMeetingId, `motions`, motion.sequential_number]);
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
        const indexOfCurrent = this._sortedMotions.findIndex(motion => motion === this.motion);
        if (indexOfCurrent > 0) {
            this.previousMotion = this._sortedMotions[indexOfCurrent - 1];
        } else {
            this.previousMotion = null;
        }
        if (indexOfCurrent > -1 && indexOfCurrent < this._sortedMotions.length - 1) {
            this.nextMotion = this._sortedMotions[indexOfCurrent + 1];
        } else {
            this.nextMotion = null;
        }
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
    @HostListener(`window:beforeunload`, [`$event`])
    public stopClosing(event: Event): void {
        if (this.editMotion) {
            event.returnValue = false;
        }
    }

    public addToAgenda(): void {
        this.itemRepo.addToAgenda({}, this.motion).resolve().catch(this.raiseError);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.motion.agenda_item_id!).catch(this.raiseError);
    }

    public onIdFound(id: Id | null): void {
        if (this._motionId !== id) {
            this.onRouteChanged();
        }
        this._motionId = id;
        if (id) {
            this.loadMotionById();
        } else {
            this.initNewMotion();
        }
        this.hasLoaded.next(true);
    }

    private registerSubjects(): void {
        this._motionObserver = this.repo.getViewModelListObservable();
        // since updates are usually not commig at the same time, every change to
        // any subject has to mark the view for chekcing
        this.subscriptions.push(
            this._motionObserver.subscribe(() => {
                this.cd.markForCheck();
            })
        );
    }

    private initNewMotion(): void {
        // new motion
        super.setTitle(`New motion`);
        this.newMotion = true;
        this.editMotion = true;
        this.motion = {} as any;
        if (this.route.snapshot.queryParams[`parent`]) {
            this.initializeAmendment();
        }
    }

    private loadMotionById(motionId: Id | null = this._motionId): void {
        if (this._hasModelSubscriptionInitiated || !motionId) {
            return; // already fired!
        }
        this._hasModelSubscriptionInitiated = true;

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

    /**
     * Using Shift, Alt + the arrow keys will navigate between the motions
     *
     * @param event has the key code
     */
    @HostListener(`document:keydown`, [`$event`])
    public onKeyNavigation(event: KeyboardEvent): void {
        if (event.key === `ArrowLeft` && event.altKey && event.shiftKey) {
            this.navigateToMotion(this.previousMotion);
        }
        if (event.key === `ArrowRight` && event.altKey && event.shiftKey) {
            this.navigateToMotion(this.nextMotion);
        }
    }

    /**
     * Creates a motion. Calls the "patchValues" function in the MotionObject
     */
    public async createMotion(newMotionValues: Partial<Motion>): Promise<void> {
        try {
            let response: HasSequentialNumber;
            if (this._parentId) {
                response = await this.amendmentRepo.createTextBased({
                    ...newMotionValues,
                    lead_motion_id: this._parentId
                });
            } else {
                response = (await this.repo.create(newMotionValues))[0];
            }
            await this.navigateAfterCreation(response);
        } catch (e) {
            this.raiseError(e);
        }
    }

    private async updateMotion(newMotionValues: any, motion: ViewMotion): Promise<void> {
        await this.repo.update(newMotionValues, motion).resolve();
    }

    private async ensureParentIsAvailable(parentId: Id): Promise<void> {
        if (!this.repo.getViewModel(parentId)) {
            const loaded = new Deferred();
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
        this._parentId = +this.route.snapshot.queryParams[`parent`] || null;
        this.amendmentEdit = true;
        await this.ensureParentIsAvailable(this._parentId!);
        const parentMotion = this.repo.getViewModel(this._parentId!);
        motion.lead_motion_id = this._parentId;
        if (parentMotion) {
            const defaultTitle = `${this.translate.instant(`Amendment to`)} ${parentMotion.numberOrTitle}`;
            motion.title = defaultTitle;
            motion.category_id = parentMotion.category_id;
            const amendmentTextMode = this.meetingSettingService.instant(`motions_amendments_text_mode`);
            if (amendmentTextMode === `fulltext`) {
                motion.text = parentMotion.text;
            }
            this.motion = motion;
        }
    }

    /**
     * Lifecycle routine for motions to initialize.
     */
    private init(): void {
        this.cd.reattach();

        this.registerSubjects();

        // use the filter and the search service to get the current sorting
        if (this.motion && this.motion.lead_motion_id && !this._amendmentsInMainList) {
            // only use the amendments for this motion
            this.amendmentSortService.initSorting();
            this.amendmentFilterService.initFilters(
                this.amendmentRepo.getSortedViewModelListObservableFor(
                    { id: this.motion.lead_motion_id },
                    this.amendmentSortService.repositorySortingKey
                )
            );
            this._sortedMotionsObservable = this.amendmentFilterService.outputObservable;
        } else {
            this.motionSortService.initSorting();
            this.motionFilterService.initFilters(
                this.repo.getSortedViewModelListObservable(this.motionSortService.repositorySortingKey)
            );
            this._sortedMotionsObservable = this.motionFilterService.outputObservable;
        }

        if (this._sortedMotionsObservable) {
            this.subscriptions.push(
                this._sortedMotionsObservable.subscribe(motions => {
                    if (motions) {
                        this._sortedMotions = motions;
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
                `Warning: Amendments exist for this motion. Editing this text will likely impact them negatively. Particularily, amendments might become unusable if the paragraph they affect is deleted.`
            );
            this.raiseWarning(msg);
        }
    }

    /**
     * Lifecycle routine for motions to get destroyed.
     */
    private destroy(): void {
        this._hasModelSubscriptionInitiated = false;
        this.cleanSubscriptions();
        this.viewService.reset();
        this.cd.detach();
    }

    private onRouteChanged(): void {
        this.destroy();
        this.init();
    }

    private async navigateAfterCreation(motion: HasSequentialNumber): Promise<void> {
        this.router.navigate([this.activeMeetingId, `motions`, motion!.sequential_number]);
    }
}
