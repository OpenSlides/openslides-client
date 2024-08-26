import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, filter, Observable, of, skip } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ChangeRecoMode, LineNumberingMode, PERSONAL_NOTE_ID } from 'src/app/domain/models/motions/motions.constants';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import {
    ViewMotion,
    ViewMotionChangeRecommendation,
    ViewUnifiedChange
} from 'src/app/site/pages/meetings/pages/motions';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AgendaItemControllerService } from '../../../../../../../agenda/services/agenda-item-controller.service/agenda-item-controller.service';
import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionChangeRecommendationControllerService } from '../../../../../../modules/change-recommendations/services';
import { MOTION_DETAIL_SUBSCRIPTION } from '../../../../../../motions.subscription';
import { AmendmentControllerService } from '../../../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionLineNumberingService } from '../../../../../../services/common/motion-line-numbering.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { MotionPdfExportService } from '../../../../../../services/export/motion-pdf-export.service/motion-pdf-export.service';
import { AmendmentListFilterService } from '../../../../../../services/list/amendment-list-filter.service/amendment-list-filter.service';
import { AmendmentListSortService } from '../../../../../../services/list/amendment-list-sort.service/amendment-list-sort.service';
import { MotionListFilterService } from '../../../../../../services/list/motion-list-filter.service/motion-list-filter.service';
import { MotionListSortService } from '../../../../../../services/list/motion-list-sort.service/motion-list-sort.service';
import { MotionDetailViewOriginUrlService } from '../../../../services/motion-detail-view-originurl.service';

@Component({
    selector: `os-motion-view`,
    templateUrl: `./motion-view.component.html`,
    styleUrls: [`./motion-view.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionViewComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    public readonly collection = ViewMotion.COLLECTION;

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

    public hasChangeRecommendations: boolean = false;
    public unifiedChanges: ViewUnifiedChange[] = [];

    /**
     * preloaded next motion for direct navigation
     */
    public nextMotion: ViewMotion | null = null;
    public previousMotion: ViewMotion | null = null;

    public get showNavigateButtons(): boolean {
        return !!this.previousMotion || !!this.nextMotion;
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
    private _sortedMotionsObservable: Observable<ViewMotion[]> = of([]);

    private _motion: ViewMotion | null = null;
    private _motionId: Id | null = null;

    private _hasModelSubscriptionInitiated = false;

    private _amendmentsInMainList = false;

    private _navigatedFromAmendmentList = false;

    public constructor(
        protected override translate: TranslateService,
        public vp: ViewPortService,
        public operator: OperatorService,
        public perms: MotionPermissionService,
        private route: ActivatedRoute,
        public repo: MotionControllerService,
        private promptService: PromptService,
        private itemRepo: AgendaItemControllerService,
        private motionSortService: MotionListSortService,
        private motionFilterService: MotionListFilterService,
        private motionForwardingService: MotionForwardDialogService,
        private motionLineNumbering: MotionLineNumberingService,
        private amendmentRepo: AmendmentControllerService,
        private amendmentSortService: AmendmentListSortService,
        private amendmentFilterService: AmendmentListFilterService,
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private cd: ChangeDetectorRef,
        private pdfExport: MotionPdfExportService,
        private originUrlService: MotionDetailViewOriginUrlService
    ) {
        super();

        this.subscriptions.push(
            this.activeMeetingIdService.meetingIdObservable.pipe(skip(1)).subscribe(id => {
                if (this.motion && this.motion.meeting_id !== id) {
                    this.motion = null;
                    if (this.hasLoaded$.value) {
                        this.hasLoaded$.next(false);
                    }
                }
            }),
            this.route.params.pipe(skip(1)).subscribe((params: Params) => {
                if (+params[`id`] !== this.motion?.id) {
                    this.motion = null;
                    if (this.hasLoaded$.value) {
                        this.hasLoaded$.next(false);
                    }
                }
            })
        );
    }

    /**
     * Init.
     * Sets all required subjects and fills in the required information
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.vp.isMobileSubject.subscribe(() => {
                this.cd.markForCheck();
            }),
            this.meetingSettingsService
                .get(`motions_amendments_in_main_list`)
                .subscribe(enabled => (this._amendmentsInMainList = enabled))
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
        let title = this.translate.instant(`Are you sure you want to delete this motion? `);
        let content = this.motion.getTitle();
        if (this.motion.amendments.length) {
            title = this.translate.instant(
                `Warning: Amendments exist for this motion. Are you sure you want to delete this motion regardless?`
            );
            content =
                `<i>${this.translate.instant(`Motion`)} ${this.motion.getTitle()}</i><br>` +
                `${this.translate.instant(`Deleting this motion will also delete the amendments.`)}<br>` +
                `${this.translate.instant(`List of amendments: `)}<br>` +
                this.motion.amendments
                    .map(amendment => (amendment.number ? amendment.number : amendment.title))
                    .join(`, `);
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
            // update the current motion
            this.motion = motion;
            this.setSurroundingMotions();
        }
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionForwardingService.forwardMotionsToMeetings(this.motion);
    }

    /**
     * Click handler for the pdf button
     */
    public onDownloadPdf(): void {
        this.pdfExport.exportSingleMotion(this.motion, {
            lnMode:
                this.lineNumberingMode === LineNumberingMode.Inside
                    ? LineNumberingMode.Outside
                    : this.lineNumberingMode,
            crMode: this.changeRecoMode,
            // export all comment fields as well as personal note
            comments: this.motion.usedCommentSectionIds.concat([PERSONAL_NOTE_ID])
        });
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
            this.hasLoaded$.next(true);
        }
    }

    private loadMotionById(motionId: Id | null = this._motionId): void {
        if (this._hasModelSubscriptionInitiated || !motionId) {
            return; // already fired!
        }
        this._hasModelSubscriptionInitiated = true;

        this.subscriptions.updateSubscription(
            `motion`,
            this.repo.getViewModelObservable(motionId).subscribe(motion => {
                if (motion) {
                    const title = motion.getTitle();
                    super.setTitle(title);
                    this.motion = motion;
                    if (!this.hasLoaded$.value) {
                        this.modelRequestService.waitSubscriptionReady(MOTION_DETAIL_SUBSCRIPTION).then(() => {
                            if (this.motion.id === motionId) {
                                this.nextMotionLoaded();
                                this.hasLoaded$.next(true);
                            }
                        });
                    }
                    this.cd.markForCheck();
                }
            })
        );
    }

    private nextMotionLoaded(): void {
        this.subscriptions.updateSubscription(
            `sorted-changes`,
            combineLatest([
                this.meetingSettingsService.get(`motions_line_length`),
                this.changeRecoRepo.getChangeRecosOfMotionObservable(this.motion.id).pipe(filter(value => !!value)),
                this.amendmentRepo.getViewModelListObservableFor(this.motion).pipe(filter(value => !!value))
            ]).subscribe(([lineLength, changeRecos, amendments]) => {
                this.hasChangeRecommendations = !!changeRecos?.length;
                this.unifiedChanges = this.motionLineNumbering.recalcUnifiedChanges(
                    lineLength,
                    changeRecos as ViewMotionChangeRecommendation[],
                    amendments
                );
                this.changeRecoMode = this.determineCrMode(this.changeRecoMode);
                this.cd.markForCheck();
            })
        );
    }

    /**
     * Lifecycle routine for motions to initialize.
     */
    private init(): void {
        this.isNavigatedFromAmendments();

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

        this.lineNumberingMode = this.meetingSettingsService.instant(`motions_default_line_numbering`);
        this.changeRecoMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`);
        /**
        if (!previous?.amendment_paragraphs && !!current?.amendment_paragraphs) {
            const recoMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`);
            if (recoMode) {
                this.setChangeRecoMode(this.determineCrMode(recoMode as ChangeRecoMode));
            }
        }
        **/

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
     * Lifecycle routine for motions to get destroyed.
     */
    private destroy(): void {
        this._hasModelSubscriptionInitiated = false;
        this.subscriptions.delete(`sorted-motions`);
        this.subscriptions.delete(`sorted-changes`);
    }

    private onRouteChanged(): void {
        this.destroy();
        this.init();
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
        const previousUrl = this.originUrlService.getPreviousUrl();
        if (!!previousUrl) {
            if (previousUrl.endsWith(`amendments`)) {
                this._navigatedFromAmendmentList = true;
            } else if (previousUrl.endsWith(`motions`)) {
                this._navigatedFromAmendmentList = false;
            }
        }
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
            if (!!this._sortedMotions[i].hasLeadMotion) {
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
