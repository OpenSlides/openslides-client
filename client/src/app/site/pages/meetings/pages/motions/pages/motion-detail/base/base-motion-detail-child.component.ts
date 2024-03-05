import { Directive, inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion, ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';

import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionChangeRecommendationControllerService } from '../../../modules/change-recommendations/services';
import { ViewUnifiedChange } from '../../../modules/change-recommendations/view-models/view-unified-change';
import { MotionBlockControllerService } from '../../../modules/motion-blocks/services';
import { MotionStatuteParagraphControllerService } from '../../../modules/statute-paragraphs/services';
import { TagControllerService } from '../../../modules/tags/services';
import { MotionWorkflowControllerService } from '../../../modules/workflows/services/motion-workflow-controller.service/motion-workflow-controller.service';
import { AmendmentControllerService } from '../../../services/common/amendment-controller.service';
import { MotionControllerService } from '../../../services/common/motion-controller.service/motion-controller.service';
import { MotionFormatService } from '../../../services/common/motion-format.service/motion-format.service';
import { MotionLineNumberingService } from '../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { MotionDetailServiceCollectorService } from '../services/motion-detail-service-collector.service/motion-detail-service-collector.service';
import { MotionDetailViewService } from '../services/motion-detail-view.service';

@Directive()
export abstract class BaseMotionDetailChildComponent extends BaseMeetingComponent {
    @Input()
    public set motion(motion: ViewMotion) {
        const previousMotion = this._motion;
        this._motion = motion;
        if (!previousMotion || this._motion.id !== previousMotion.id) {
            this.doUpdate();
        }

        if (!Object.keys(previousMotion || {}).length && Object.keys(motion).length) {
            this.onInitTextBasedAmendment(); // Assuming that it's an amendment
        }

        this.onAfterSetMotion(previousMotion, motion);
    }

    public get motion(): ViewMotion {
        return this._motion!;
    }

    @Input()
    public newMotion = false;

    @Input()
    public set editMotion(isEditing: boolean) {
        this._isEditing = isEditing;
        if (isEditing) {
            this.onEnterEditMode();
        }
    }

    public get editMotion(): boolean {
        return this._isEditing;
    }

    public get lineNumberingMode(): LineNumberingMode {
        return this.viewService.currentLineNumberingMode;
    }

    public get changeRecoMode(): ChangeRecoMode {
        return this.viewService.currentChangeRecommendationMode;
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

    public get parent(): ViewMotion | null {
        return this.motion?.lead_motion || null;
    }

    /**
     * Whether to show all amendments in the text, not only the ones with the apropriate state
     */
    public get showAllAmendments(): boolean {
        return this.viewService.currentShowAllAmendmentsState;
    }

    ///////////////////////////////////////////////
    /////// Getter to repos & services
    ///////////////////////////////////////////////

    protected get repo(): MotionControllerService {
        return this.motionServiceCollector.motionRepo;
    }

    public get categoryRepo(): MotionCategoryControllerService {
        return this.motionServiceCollector.categoryRepo;
    }

    public get workflowRepo(): MotionWorkflowControllerService {
        return this.motionServiceCollector.workflowRepo;
    }

    public get participantRepo(): ParticipantControllerService {
        return this.motionServiceCollector.participantRepo;
    }

    protected get amendmentRepo(): AmendmentControllerService {
        return this.motionServiceCollector.amendmentRepo;
    }

    protected get blockRepo(): MotionBlockControllerService {
        return this.motionServiceCollector.blockRepo;
    }

    protected get tagRepo(): TagControllerService {
        return this.motionServiceCollector.tagRepo;
    }

    protected get statuteRepo(): MotionStatuteParagraphControllerService {
        return this.motionServiceCollector.statuteRepo;
    }

    protected get changeRecoRepo(): MotionChangeRecommendationControllerService {
        return this.motionServiceCollector.changeRecoRepo;
    }

    protected get motionLineNumbering(): MotionLineNumberingService {
        return this.motionServiceCollector.motionLineNumbering;
    }

    protected get motionFormatService(): MotionFormatService {
        return this.motionServiceCollector.motionFormatService;
    }

    protected get viewService(): MotionDetailViewService {
        return this.motionServiceCollector.motionViewService;
    }

    ///////////////////////////////////////////////
    /////// Settings variables
    ///////////////////////////////////////////////

    public multipleParagraphsAllowed = false;
    public reasonRequired = false;
    public statutesEnabled = false;
    public minSupporters = 0;
    public preamble = ``;
    public showReferringMotions = false;
    public showSequentialNumber = false;
    protected lineLength = 0;
    protected sortedChangingObjects: ViewUnifiedChange[] | null = null;

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    /**
     * All change recommendations to this motion
     */
    public changeRecommendations: ViewUnifiedChange[] = [];
    /**
     * Value for os-motion-detail-diff: when this is set, that component scrolls to the given change
     */
    public scrollToChange: ViewUnifiedChange | null = null;

    protected amendments: ViewMotion[] = [];

    private _isEditing = false;
    private _motion: ViewMotion | null = null;

    protected override translate = inject(TranslateService);
    protected motionServiceCollector = inject(MotionDetailServiceCollectorService);

    /**
     * In the original version, a change-recommendation-annotation has been clicked
     * -> Go to the diff view and scroll to the change recommendation
     */
    public gotoChangeRecommendation(changeRecommendation: ViewUnifiedChange): void {
        this.scrollToChange = changeRecommendation;
        this.viewService.changeRecommendationModeSubject.next(ChangeRecoMode.Diff);
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
     * Function called when the edit-mode is set to `true`
     */
    protected onEnterEditMode(): void {}

    /**
     * Function called when a new motion is passed and it's an text-based amendment
     */
    protected onInitTextBasedAmendment(): void {}

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
            this.changeRecoRepo
                .getChangeRecosOfMotionObservable(this.motion.id)
                .pipe(filter(value => !!value))
                .subscribe(changeRecos => {
                    this.changeRecommendations = changeRecos;
                    this.sortedChangingObjects = null;
                }),
            this.amendmentRepo
                .getViewModelListObservableFor(this.motion)
                .pipe(filter(value => !!value))
                .subscribe((amendments: ViewMotion[]): void => {
                    this.amendments = amendments;
                    this.motionLineNumbering.resetAmendmentChangeRecoListeners(amendments);
                    this.sortedChangingObjects = null;
                })
        ];
    }

    private getSharedSubscriptionsToSettings(): Subscription[] {
        return [
            this.meetingSettingsService.get(`motions_line_length`).subscribe(lineLength => {
                this.lineLength = lineLength;
                this.sortedChangingObjects = null;
            }),
            this.meetingSettingsService
                .get(`motions_reason_required`)
                .subscribe(required => (this.reasonRequired = required)),
            this.meetingSettingsService
                .get(`motions_supporters_min_amount`)
                .subscribe(value => (this.minSupporters = value)),
            this.meetingSettingsService.get(`motions_preamble`).subscribe(value => (this.preamble = value)),
            this.meetingSettingsService
                .get(`motions_statutes_enabled`)
                .subscribe(value => (this.statutesEnabled = value)),
            this.meetingSettingsService.get(`motions_amendments_multiple_paragraphs`).subscribe(allowed => {
                this.multipleParagraphsAllowed = allowed;
            }),
            this.meetingSettingsService
                .get(`motions_show_referring_motions`)
                .subscribe(show => (this.showReferringMotions = show)),
            this.meetingSettingsService
                .get(`motions_show_sequential_number`)
                .subscribe(shown => (this.showSequentialNumber = shown))
        ];
    }
}
