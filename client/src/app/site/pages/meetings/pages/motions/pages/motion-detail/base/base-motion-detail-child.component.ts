import { ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { auditTime, BehaviorSubject, combineLatest, filter, Observable, Subscription } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion, ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';

import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionChangeRecommendationControllerService } from '../../../modules/change-recommendations/services';
import { ViewUnifiedChange } from '../../../modules/change-recommendations/view-models/view-unified-change';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { TagControllerService } from '../../../modules/tags/services';
import { AmendmentControllerService } from '../../../services/common/amendment-controller.service';
import { MotionControllerService } from '../../../services/common/motion-controller.service/motion-controller.service';
import { MotionFormatService } from '../../../services/common/motion-format.service/motion-format.service';
import { MotionLineNumberingService } from '../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { MotionDetailViewService } from '../services/motion-detail-view.service';

@Directive()
export abstract class BaseMotionDetailChildComponent extends BaseMeetingComponent {
    protected cd: ChangeDetectorRef = inject(ChangeDetectorRef);

    @Input()
    public set motion(motion: ViewMotion) {
        const previousMotion = this._motion;
        this._motion = motion;
        if (!previousMotion || this._motion.id !== previousMotion.id) {
            this.doUpdate();
        }

        this.onAfterSetMotion(previousMotion, motion);
        this.cd.markForCheck();
    }

    public get motion(): ViewMotion {
        return this._motion!;
    }

    public get lineNumberingMode$(): Observable<LineNumberingMode> {
        return this.viewService.lineNumberingModeSubject;
    }

    public get changeRecoMode$(): Observable<ChangeRecoMode> {
        return this.viewService.changeRecommendationModeSubject;
    }

    public get hasChangingObjects(): boolean {
        if (this.sortedChangingObjects !== null) {
            return this.sortedChangingObjects.length > 0;
        }

        return (
            (this.changeRecommendations && this.changeRecommendations.length > 0) ||
            (this.amendments && this.amendments.filter(amendment => amendment.isParagraphBasedAmendment()).length > 0)
        );
    }

    /**
     * Whether to show all amendments in the text, not only the ones with the apropriate state
     */
    public get showAllAmendments(): boolean {
        return this.viewService.currentShowAllAmendmentsState;
    }

    public get showAllAmendments$(): Observable<boolean> {
        return this.viewService.showAllAmendmentsStateSubject;
    }

    ///////////////////////////////////////////////
    /////// Repos & services
    ///////////////////////////////////////////////

    public categoryRepo = inject(MotionCategoryControllerService);

    protected repo = inject(MotionControllerService);
    protected amendmentRepo = inject(AmendmentControllerService);
    protected blockRepo = inject(MotionBlockControllerService);
    protected tagRepo = inject(TagControllerService);
    protected changeRecoRepo = inject(MotionChangeRecommendationControllerService);
    protected motionLineNumbering = inject(MotionLineNumberingService);
    protected motionFormatService = inject(MotionFormatService);
    protected viewService = inject(MotionDetailViewService);

    protected override translate = inject(TranslateService);

    ///////////////////////////////////////////////
    /////// Settings variables
    ///////////////////////////////////////////////

    protected lineLength = 0;
    protected sortedChangingObjects: ViewUnifiedChange[] | null = null;
    protected readonly sortedChangingObjectsSubject: BehaviorSubject<ViewUnifiedChange[]> = new BehaviorSubject([]);

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    /**
     * All change recommendations to this motion
     */
    private changeRecommendations: ViewUnifiedChange[] = [];
    public get changeRecommendations$(): Observable<ViewUnifiedChange[]> {
        return this.changeRecoRepo.getChangeRecosOfMotionObservable(this.motion.id).pipe(filter(value => !!value));
    }

    /**
     * Value for os-motion-detail-diff: when this is set, that component scrolls to the given change
     */
    public scrollToChange: ViewUnifiedChange | null = null;

    private amendments: ViewMotion[] = [];
    protected get amendments$(): Observable<ViewMotion[]> {
        return this.amendmentRepo.getViewModelListObservableFor(this.motion).pipe(filter(value => !!value));
    }

    private _motion: ViewMotion | null = null;

    /**
     * In the original version, a change-recommendation-annotation has been clicked
     * -> Go to the diff view and scroll to the change recommendation
     */
    public gotoChangeRecommendation(changeRecommendation: ViewUnifiedChange): void {
        this.scrollToChange = changeRecommendation;
        this.viewService.changeRecommendationModeSubject.next(ChangeRecoMode.Diff);
    }

    protected updateAllChangingObjectsSorted(): void {
        const sortedChangingObjects = this.motionLineNumbering.recalcUnifiedChanges(
            this.lineLength,
            this.changeRecommendations as ViewMotionChangeRecommendation[],
            this.amendments
        );
        this.sortedChangingObjectsSubject.next(sortedChangingObjects);
        this.sortedChangingObjects = sortedChangingObjects;
    }

    protected getAllChangingObjectsSorted(): ViewUnifiedChange[] {
        if (!this.sortedChangingObjects) {
            this.sortedChangingObjects = this.motionLineNumbering.recalcUnifiedChanges(
                this.lineLength,
                this.changeRecommendations as ViewMotionChangeRecommendation[],
                this.amendments
            );
        }
        return this.sortedChangingObjects!;
    }

    /**
     * Function called after all eventual updates whenever the motion setter is called
     */
    protected onAfterSetMotion(_previous: ViewMotion, _current: ViewMotion): void {}

    /**
     * Function called when a new motion is passed and right after the internal `init`-function was called
     */
    protected onAfterInit(): void {}

    protected getSubscriptions(): Subscription[] {
        return [];
    }

    private doUpdate(): void {
        this.destroy();
        this.init();
    }

    private init(): void {
        this.subscriptions.push(
            ...this.getSharedSubscriptionsToSettings(),
            ...this.getSharedSubscriptionsToRepositories(),
            ...this.getSubscriptions()
        );
        this.onAfterInit();
    }

    private destroy(): void {
        this.cleanSubscriptions();
    }

    private getSharedSubscriptionsToRepositories(): Subscription[] {
        return [
            combineLatest([this.changeRecommendations$, this.amendments$])
                .pipe(auditTime(500))
                .subscribe(([changeRecos, amendments]) => {
                    this.sortedChangingObjects = null;
                    this.changeRecommendations = changeRecos;
                    this.amendments = amendments;
                    this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);
                    this.updateAllChangingObjectsSorted();
                })
        ];
    }

    private getSharedSubscriptionsToSettings(): Subscription[] {
        return [
            this.meetingSettingsService.get(`motions_line_length`).subscribe(lineLength => {
                this.lineLength = lineLength;
                this.sortedChangingObjects = null;
            })
        ];
    }
}
