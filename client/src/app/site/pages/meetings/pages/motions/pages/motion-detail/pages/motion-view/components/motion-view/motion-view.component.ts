import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    auditTime,
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    Observable,
    startWith,
    Subject,
    Subscription,
    switchMap
} from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { ChangeRecoMode, LineNumberingMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import {
    ViewMotion,
    ViewMotionChangeRecommendation,
    ViewUnifiedChange
} from 'src/app/site/pages/meetings/pages/motions';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AgendaItemControllerService } from '../../../../../../../agenda/services/agenda-item-controller.service/agenda-item-controller.service';
import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionChangeRecommendationControllerService } from '../../../../../../modules/change-recommendations/services';
import { DiffServiceFactory } from '../../../../../../modules/change-recommendations/services/diff-factory.service';
import {
    getMotionOriginDetailSubscriptionConfig,
    MOTION_DETAIL_SUBSCRIPTION,
    MOTION_ORIGIN_DETAIL_SUBSCRIPTION
} from '../../../../../../motions.subscription';
import { AmendmentControllerService } from '../../../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionLineNumberingService } from '../../../../../../services/common/motion-line-numbering.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { MotionPdfExportService } from '../../../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';
import { AmendmentListFilterService } from '../../../../../../services/list/amendment-list-filter.service/amendment-list-filter.service';
import { AmendmentListSortService } from '../../../../../../services/list/amendment-list-sort.service/amendment-list-sort.service';
import { MotionListFilterService } from '../../../../../../services/list/motion-list-filter.service/motion-list-filter.service';
import { MotionListSortService } from '../../../../../../services/list/motion-list-sort.service/motion-list-sort.service';
import { MotionDeleteDialogComponent } from '../motion-delete-dialog/motion-delete-dialog.component';

@Component({
    selector: `os-motion-view`,
    templateUrl: `./motion-view.component.html`,
    styleUrls: [`./motion-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class MotionViewComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    public readonly collection = ViewMotion.COLLECTION;

    /**
     * Sets the motions, e.g. via an autoupdate. Reload important things here:
     * - Reload the recommendation. Not changed with autoupdates, but if the motion is loaded this needs to run.
     */
    public set motion(motion: ViewMotion) {
        this._motion = motion;
    }

    public get motion(): ViewMotion {
        return this._motion;
    }

    public hasChangeRecommendations = false;
    public unifiedChanges$ = new BehaviorSubject<ViewUnifiedChange[]>([]);

    public originMotionTabSelected = 0;
    public originMotionsLoaded: ViewMotion[] = [];
    public originMotionsChangeRecoMode: Record<Id, ChangeRecoMode> = {};
    public originMotionsLineNumberingMode: Record<Id, LineNumberingMode> = {};
    public originUnifiedChanges: Record<Id, ViewUnifiedChange[]> = {};

    private get unifiedChanges(): ViewUnifiedChange[] {
        return this.unifiedChanges$.value;
    }

    public showAllAmendments = false;
    private _forwardingAvailable = false;

    /**
     * preloaded next motion for direct navigation
     */
    public nextMotion: ViewMotion | null = null;
    public previousMotion: ViewMotion | null = null;

    public get showNavigateButtons(): boolean {
        return !!this.previousMotion || !!this.nextMotion;
    }

    public get showForwardMenuEntry(): boolean {
        const derivedMotionMeetingIds = this.motion.derived_motions?.map(derivedMotion => +derivedMotion.meeting_id);
        const forwardingMeetingsIds = this.motionForwardingService.forwardingMeetingIds;
        return (
            !!this.motion.state?.allow_motion_forwarding &&
            this.operator.hasPerms(Permission.motionCanForward) &&
            this._forwardingAvailable &&
            forwardingMeetingsIds.some(meetingId => !derivedMotionMeetingIds.includes(meetingId))
        );
    }

    public get showForwardButton(): boolean {
        return this.showForwardMenuEntry && !this.motion.derived_motions.length;
    }

    private _changeRecoMode: ChangeRecoMode = ChangeRecoMode.Original;
    public get changeRecoMode(): ChangeRecoMode {
        return this._changeRecoMode;
    }

    public set changeRecoMode(value: ChangeRecoMode) {
        this._changeRecoMode = value;
        this.cd.markForCheck();
    }

    private _lineNumberingMode: LineNumberingMode = LineNumberingMode.None;
    public get lineNumberingMode(): LineNumberingMode {
        return this._lineNumberingMode;
    }

    public set lineNumberingMode(value: LineNumberingMode) {
        this._lineNumberingMode = value;
        this.cd.markForCheck();
    }

    public hasLoaded$ = new BehaviorSubject(false);

    /**
     * List of presorted motions. Filles by sort service
     * and filter service.
     * To navigate back and forth
     */
    private _sortedMotions: ViewMotion[] = [];

    /**
     * The observable for the list of motions. Set in OnInit
     */
    private _sortedMotionsObservable: Observable<ViewMotion[]> = null;

    private _motion: ViewMotion | null = null;

    private _amendmentsInMainList = false;

    private _navigatedFromAmendmentList = false;

    private motionLineNumbering = inject(MotionLineNumberingService);

    public constructor(
        protected override translate: TranslateService,
        public vp: ViewPortService,
        public operator: OperatorService,
        public perms: MotionPermissionService,
        private route: ActivatedRoute,
        public repo: MotionControllerService,
        private meetingRepo: MeetingRepositoryService,
        private promptService: PromptService,
        private itemRepo: AgendaItemControllerService,
        private motionSortService: MotionListSortService,
        private motionFilterService: MotionListFilterService,
        private motionForwardingService: MotionForwardDialogService,
        private diffFactory: DiffServiceFactory,
        private amendmentRepo: AmendmentControllerService,
        private amendmentSortService: AmendmentListSortService,
        private amendmentFilterService: AmendmentListFilterService,
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog,
        private pdfExport: MotionPdfExportService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private autoupdateService: AutoupdateService
    ) {
        super();

        this.subscriptions.push(
            this.router.events
                .pipe(
                    filter((event): boolean => event instanceof RoutesRecognized),
                    distinctUntilChanged((p: RoutesRecognized, c: RoutesRecognized) => p?.url === c?.url)
                )
                .subscribe(() => this.onMotionChange())
        );

        if (operator.hasPerms(Permission.motionCanForward)) {
            this.motionForwardingService.forwardingMeetingsAvailable().then(forwardingAvailable => {
                this._forwardingAvailable = forwardingAvailable && !this.motion?.isAmendment();
                this.cd.markForCheck();
            });
        }
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        this.isNavigatedFromAmendments();

        this.subscriptions.push(
            this.meetingSettingsService
                .get(`motions_amendments_in_main_list`)
                .subscribe(enabled => (this._amendmentsInMainList = enabled)),
            this.meetingSettingsService
                .get(`motions_default_line_numbering`)
                .subscribe(val => (this.lineNumberingMode = val)),
            this.meetingSettingsService
                .get(`motions_recommendation_text_mode`)
                .subscribe(val => (this.changeRecoMode = val))
        );
    }

    /**
     * Called during view destruction.
     * Sends a notification to user editors of the motion was edited
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.amendmentSortService.exitSortService();
        this.motionSortService.exitSortService();
    }

    public onMotionChange(): void {
        if (this.hasLoaded$.value) {
            this.hasLoaded$.next(false);
        }

        this.originMotionTabSelected = 0;
        this.originMotionsLoaded = [];
        this.unifiedChanges$.next([]);
        this.subscriptions.delete(`motion`);
        this.subscriptions.delete(`sorted-changes`);
    }

    public async onMotionIdFound(id: Id | null): Promise<void> {
        if (id) {
            const lastMeetingId = this.motion?.meeting_id;
            const motionSubscription = this.repo.getViewModelObservable(id).pipe(filter(m => !!m));
            this.subscriptions.updateSubscription(
                `motion`,
                motionSubscription.subscribe(motion => this.onMotionUpdated(motion))
            );

            let motion = await firstValueFrom(motionSubscription);
            if (lastMeetingId !== motion.meeting_id) {
                this.isNavigatedFromAmendments();
                this._sortedMotionsObservable = null;
                this.subscriptions.delete(`sorted-motions`);
            }
            await this.modelRequestService.waitSubscriptionReady(MOTION_DETAIL_SUBSCRIPTION);
            if (motion.id !== id) {
                return;
            }

            this.motionLineNumbering = this.diffFactory.createService(MotionLineNumberingService, motion.diffVersion);
            this.onMotionLoaded();

            motion = await firstValueFrom(motionSubscription);
            if (
                this.meetingSettingsService.instant(`motions_enable_origin_motion_display`) &&
                this.operator.hasPerms(Permission.motionCanSeeOrigin) &&
                this.meetingSettingsService.instant(`motions_origin_motion_toggle_default`) &&
                motion.all_origin_ids
            ) {
                await this.autoupdateService.single(
                    await this.modelRequestBuilder.build(
                        getMotionOriginDetailSubscriptionConfig(...motion.all_origin_ids).modelRequest
                    ),
                    MOTION_ORIGIN_DETAIL_SUBSCRIPTION
                );

                for (const id of motion.all_origin_ids) {
                    this.addOriginMotionTab(id);
                }
            }
        }

        this.hasLoaded$.next(true);
    }

    public onMotionLoaded(): void {
        if (!this._sortedMotionsObservable) {
            this.updateSortedMotionsObservable();
        }
        this.nextMotionLoaded();
    }

    public onMotionUpdated(motion: ViewMotion): void {
        const title = motion.getTitle();
        super.setTitle(title, true);
        this.motion = motion;
        this.cd.markForCheck();
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

    public goToHistory(): void {
        this.router.navigate([this.activeMeetingId!, `history`], { queryParams: { fqid: this.motion.fqid } });
    }

    /**
     * Trigger to delete the motion.
     */
    public async deleteMotionButton(): Promise<void> {
        const dialogRef = this.dialog.open(MotionDeleteDialogComponent, {
            width: `290px`,
            data: { motion: this.motion }
        });

        if (await firstValueFrom(dialogRef.afterClosed())) {
            await this.repo.delete(this.motion);
            this.router.navigate([this.activeMeetingId, `motions`]);
        }
    }

    /**
     * Goes to the amendment creation wizard. Executed via click.
     */
    public createAmendment(): void {
        const amendmentTextMode = this.meetingSettingsService.instant(`motions_amendments_text_mode`);
        if (amendmentTextMode === `paragraph`) {
            this.router.navigate([`create-amendment`], { relativeTo: this.route });
        } else {
            this.router.navigate([this.activeMeetingId, `motions`, `new`], {
                relativeTo: this.route.snapshot.params[`relativeTo`],
                queryParams: { parent: this.motion.id || null }
            });
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
            this.setSurroundingMotions();
        }
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionForwardingService.forwardMotionsToMeetings(this.motion);
    }

    /**
     * Click handler for the pdf button
     */
    public downloadPdf(): void {
        this.pdfExport.exportSingleMotion(this.motion, {
            lnMode:
                this.lineNumberingMode === LineNumberingMode.Inside
                    ? LineNumberingMode.Outside
                    : this.lineNumberingMode,
            crMode: this.changeRecoMode,
            // export all comment fields as well as personal note
            comments: this.motion.usedCommentSectionIds.concat([PERSONAL_NOTE_ID]),
            showAllChanges: this.showAllAmendments
        });
    }

    public addToAgenda(): void {
        this.itemRepo.addToAgenda({}, this.motion).resolve().catch(this.raiseError);
    }

    public removeFromAgenda(): void {
        this.itemRepo.removeFromAgenda(this.motion.agenda_item_id!).catch(this.raiseError);
    }

    public async displayOriginMotion(id: Id): Promise<void> {
        await this.autoupdateService.single(
            await this.modelRequestBuilder.build(getMotionOriginDetailSubscriptionConfig(id).modelRequest),
            MOTION_ORIGIN_DETAIL_SUBSCRIPTION
        );

        this.addOriginMotionTab(id);
    }

    public hideOriginMotion(id: Id): void {
        this.originMotionsLoaded = this.originMotionsLoaded.filter(m => m.id !== id);
    }

    private addOriginMotionTab(id: Id): void {
        const originMotion = this.repo.getViewModelUnsafe(id);
        if (originMotion && !this.originMotionsLoaded.find(m => m.id === id)) {
            const meeting = this.meetingRepo.getViewModelUnsafe(originMotion.meeting_id);
            originMotion.meeting = meeting;

            this.originMotionsLoaded = [...this.originMotionsLoaded, originMotion].sort((a, b) => b.id - a.id);
            this.originUnifiedChanges[id] = this.motionLineNumbering.recalcUnifiedChanges(
                originMotion.meeting?.motions_line_length || this.meetingSettingsService.instant(`motions_line_length`),
                originMotion.change_recommendations,
                originMotion.amendments
            );
            this.originMotionsChangeRecoMode[id] = ChangeRecoMode.Diff;
            this.originMotionsLineNumberingMode[id] =
                originMotion.meeting?.motions_default_line_numbering || this.lineNumberingMode;
        }
    }

    private nextMotionLoaded(): void {
        this.changeRecoMode =
            this.meetingSettingsService.instant(`motions_recommendation_text_mode`) || ChangeRecoMode.Original;

        this.subscriptions.updateSubscription(
            `sorted-changes`,
            this.sortedChangesSubscription(this.motion.id, this.unifiedChanges$)
        );
    }

    private sortedChangesSubscription(motionId: Id, subject: Subject<ViewUnifiedChange[]>): Subscription {
        let previousAmendments: ViewMotion[] = null;

        return combineLatest([
            this.meetingSettingsService.get(`motions_line_length`),
            this.changeRecoRepo.getChangeRecosOfMotionObservable(motionId).pipe(filter(value => !!value)),
            this.repo.getViewModelObservable(motionId).pipe(
                filter(m => !!m),
                switchMap(m => m.amendments$.pipe(startWith([])))
            )
        ])
            .pipe(auditTime(1)) // Needed to replicate behaviour of base-repository list updates
            .subscribe(([lineLength, changeRecos, amendments]) => {
                if (motionId === this.motion.id) {
                    if (previousAmendments !== amendments) {
                        this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);
                        previousAmendments = amendments;
                    }
                    this.hasChangeRecommendations = !!changeRecos?.length;
                }
                subject.next(
                    this.motionLineNumbering.recalcUnifiedChanges(
                        lineLength,
                        changeRecos as ViewMotionChangeRecommendation[],
                        amendments
                    )
                );
                if (motionId === this.motion.id) {
                    this.changeRecoMode = this.determineCrMode(this.changeRecoMode);
                }
                this.cd.markForCheck();
            });
    }

    private updateSortedMotionsObservable(): void {
        // use the filter and the search service to get the current sorting
        if (
            this.motion &&
            this.motion.lead_motion_id &&
            (!this._amendmentsInMainList || this._navigatedFromAmendmentList)
        ) {
            // only use the amendments for this motion
            this.amendmentSortService.initSorting();
            this.amendmentFilterService.initFilters(
                this.amendmentRepo.getSortedViewModelListObservableFor(
                    { id: this.motion.lead_motion_id },
                    this.amendmentSortService.repositorySortingKey
                )
            );
            if (this._amendmentsInMainList && this._navigatedFromAmendmentList) {
                this.amendmentFilterService.parentMotionId = null;
            }
            this._sortedMotionsObservable = this.amendmentFilterService.outputObservable;
        } else {
            this.motionSortService.initSorting();
            this.motionFilterService.initFilters(
                this.repo.getSortedViewModelListObservable(this.motionSortService.repositorySortingKey)
            );
            this._sortedMotionsObservable = this.motionFilterService.outputObservable;
        }

        if (this._sortedMotionsObservable) {
            this.subscriptions.updateSubscription(
                `sorted-motions`,
                this._sortedMotionsObservable.subscribe(motions => {
                    if (motions) {
                        this._sortedMotions = motions;
                        this.setSurroundingMotions();
                    }
                })
            );
        }
    }

    /**
     * Sets the previous and next motion. Sorts by the current sorting as used
     * in the {@link MotionSortListService} or {@link AmendmentSortListService},
     * respectively
     */
    private setSurroundingMotions(): void {
        const indexOfCurrent = this._sortedMotions.findIndex(motion => motion === this.motion);
        if (indexOfCurrent > 0) {
            this.previousMotion = this.findNextSuitableMotion(indexOfCurrent, -1);
        } else {
            this.previousMotion = null;
        }
        if (indexOfCurrent > -1 && indexOfCurrent < this._sortedMotions.length - 1) {
            this.nextMotion = this.findNextSuitableMotion(indexOfCurrent, 1);
        } else {
            this.nextMotion = null;
        }
        this.cd.markForCheck();
    }

    /**
     * Sets @var this._navigatedFromAmendmentList on navigation from either of both lists.
     * Does nothing on navigation between two motions.
     */
    private isNavigatedFromAmendments(): void {
        this.storage.get('motion-navigation-last').then(last => {
            this._navigatedFromAmendmentList = last === 'amendment-list';
        });
    }

    /**
     * Finds the next suitable motion.
     * If @var this._amendmentsInMainList as well as @var this._navigatedFromAmendmentList collide
     * iterates over the next or previous motions to find the first with lead motion.
     * @param indexOfCurrent The index from the active motion.
     * @param step Stepwidth to iterate eiter over the previous or next motions.
     */
    private findNextSuitableMotion(indexOfCurrent: number, step: number): ViewMotion {
        if (!this._amendmentsInMainList || !this._navigatedFromAmendmentList) {
            return this._sortedMotions[indexOfCurrent + step];
        }

        for (let i = indexOfCurrent + step; 0 <= i && i <= this._sortedMotions.length - 1; i += step) {
            if (this._sortedMotions[i].hasLeadMotion) {
                return this._sortedMotions[i];
            }
        }
        return null;
    }

    /**
     * Tries to determine the realistic CR-Mode from a given CR mode
     */
    private determineCrMode(mode: ChangeRecoMode): ChangeRecoMode {
        if (mode === ChangeRecoMode.Final) {
            if (this.motion?.modified_final_version) {
                return ChangeRecoMode.ModifiedFinal;
                /**
                 * Because without change recos you cannot escape the final version anymore
                 */
            } else if (!this.unifiedChanges.some(change => change.showInFinalView())) {
                return ChangeRecoMode.Original;
            }
        } else if (mode === ChangeRecoMode.Changed && !this.hasChangeRecommendations) {
            /**
             * Because without change recos you cannot escape the changed version view
             * You will not be able to automatically change to the Changed view after creating
             * a change reco. The autoupdate has to come "after" this routine
             */
            return ChangeRecoMode.Original;
        } else if (
            mode === ChangeRecoMode.Diff &&
            !this.hasChangeRecommendations &&
            this.motion?.isParagraphBasedAmendment()
        ) {
            /**
             * The Diff view for paragraph-based amendments is only relevant for change recommendations;
             * the regular amendment changes are shown in the "original" view.
             */
            return ChangeRecoMode.Original;
        }
        return mode;
    }
}
