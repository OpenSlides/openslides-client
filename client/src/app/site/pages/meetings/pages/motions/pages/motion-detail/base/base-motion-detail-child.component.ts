import { ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, Observable, Subscription } from 'rxjs';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionChangeRecommendationControllerService } from '../../../modules/change-recommendations/services';
import { DiffServiceFactory } from '../../../modules/change-recommendations/services/diff-factory.service';
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

    ///////////////////////////////////////////////
    /// //// Repos & services
    ///////////////////////////////////////////////

    public categoryRepo = inject(MotionCategoryControllerService);

    protected repo = inject(MotionControllerService);
    protected amendmentRepo = inject(AmendmentControllerService);
    protected blockRepo = inject(MotionBlockControllerService);
    protected tagRepo = inject(TagControllerService);
    protected changeRecoRepo = inject(MotionChangeRecommendationControllerService);
    protected motionLineNumbering = inject(MotionLineNumberingService);
    protected diffFactory = inject(DiffServiceFactory);
    protected motionFormatService = inject(MotionFormatService);
    protected viewService = inject(MotionDetailViewService);

    protected override translate = inject(TranslateService);

    ///////////////////////////////////////////////
    /// //// Settings variables
    ///////////////////////////////////////////////

    protected get lineLength(): number {
        return this.meetingSettingsService.instant(`motions_line_length`);
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    /**
     * All change recommendations to this motion
     */
    public get changeRecommendations$(): Observable<ViewUnifiedChange[]> {
        return this.changeRecoRepo.getChangeRecosOfMotionObservable(this.motion.id).pipe(filter(value => !!value));
    }

    protected get amendments$(): Observable<ViewMotion[]> {
        return this.amendmentRepo.getViewModelListObservableFor(this.motion).pipe(filter(value => !!value));
    }

    private _motion: ViewMotion | null = null;

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
        this.motionLineNumbering = this.diffFactory.createService(MotionLineNumberingService, this._motion.diffVersion);
        this.subscriptions.push(...this.getSubscriptions());
        this.onAfterInit();
    }

    private destroy(): void {
        this.cleanSubscriptions();
    }
}
