import { Directive, Input } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { MotionLineNumberingService } from 'app/core/repositories/motions/motion-line-numbering.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { MotionService } from 'app/core/repositories/motions/motion.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewUnifiedChange } from 'app/shared/models/motions/view-unified-change';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ChangeRecoMode, LineNumberingMode } from 'app/site/motions/motions.constants';
import { MotionFormatService } from 'app/site/motions/services/motion-format.service';
import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';
import { MotionViewService } from '../../../services/motion-view.service';

@Directive()
export abstract class BaseMotionDetailChildComponent extends BaseComponent {
    @Input()
    public set motion(motion: ViewMotion) {
        const previousMotion = this._motion;
        this._motion = motion;
        if (previousMotion?.id !== motion.id) {
            this.doUpdate();
        }
        if (!Object.keys(previousMotion || {}).length && Object.keys(motion).length) {
            this.onInitTextBasedAmendment(); // Assuming that it's an amendment
        }
    }

    public get motion(): ViewMotion {
        return this._motion;
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

    /**
     * Whether to show all amendments in the text, not only the ones with the apropriate state
     */
    public get showAllAmendments(): boolean {
        return this.viewService.currentShowAllAmendmentsState;
    }

    ///////////////////////////////////////////////
    /////// Getter to repos & services
    ///////////////////////////////////////////////

    protected get repo(): MotionRepositoryService {
        return this.motionServiceCollector.motionRepo;
    }

    public get categoryRepo(): MotionCategoryRepositoryService {
        return this.motionServiceCollector.categoryRepo;
    }

    public get workflowRepo(): MotionWorkflowRepositoryService {
        return this.motionServiceCollector.workflowRepo;
    }

    public get userRepo(): UserRepositoryService {
        return this.motionServiceCollector.userRepo;
    }

    protected get blockRepo(): MotionBlockRepositoryService {
        return this.motionServiceCollector.blockRepo;
    }

    protected get tagRepo(): TagRepositoryService {
        return this.motionServiceCollector.tagRepo;
    }

    protected get statuteRepo(): MotionStatuteParagraphRepositoryService {
        return this.motionServiceCollector.statuteRepo;
    }

    protected get changeRecoRepo(): MotionChangeRecommendationRepositoryService {
        return this.motionServiceCollector.changeRecoRepo;
    }

    protected get motionService(): MotionService {
        return this.motionServiceCollector.motionService;
    }

    protected get motionLineNumbering(): MotionLineNumberingService {
        return this.motionServiceCollector.motionLineNumbering;
    }

    protected get motionFormatService(): MotionFormatService {
        return this.motionServiceCollector.motionFormatService;
    }

    protected get viewService(): MotionViewService {
        return this.motionServiceCollector.motionViewService;
    }

    ///////////////////////////////////////////////
    /////// Settings variables
    ///////////////////////////////////////////////

    public multipleParagraphsAllowed = false;
    public reasonRequired = false;
    public statutesEnabled = false;
    public minSupporters = 0;
    public preamble = '';
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
    private _motion: ViewMotion;

    public constructor(
        serviceCollector: ComponentServiceCollector,
        protected motionServiceCollector: MotionServiceCollectorService
    ) {
        super(serviceCollector);
    }

    /**
     * In the original version, a change-recommendation-annotation has been clicked
     * -> Go to the diff view and scroll to the change recommendation
     */
    public gotoChangeRecommendation(changeRecommendation: ViewMotionChangeRecommendation): void {
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
        return this.sortedChangingObjects;
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
            this.repo
                .getAmendmentsByMotionAsObservable(this.motion.id)
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
            this.meetingSettingService.get('motions_line_length').subscribe(lineLength => {
                this.lineLength = lineLength;
                this.sortedChangingObjects = null;
            }),
            this.meetingSettingService
                .get('motions_reason_required')
                .subscribe(required => (this.reasonRequired = required)),
            this.meetingSettingService
                .get('motions_supporters_min_amount')
                .subscribe(value => (this.minSupporters = value)),
            this.meetingSettingService.get('motions_preamble').subscribe(value => (this.preamble = value)),
            this.meetingSettingService
                .get('motions_statutes_enabled')
                .subscribe(value => (this.statutesEnabled = value)),
            this.meetingSettingService.get('motions_amendments_multiple_paragraphs').subscribe(allowed => {
                this.multipleParagraphsAllowed = allowed;
            }),
            this.meetingSettingService
                .get('motions_show_referring_motions')
                .subscribe(show => (this.showReferringMotions = show)),
            this.meetingSettingService
                .get('motions_show_sequential_number')
                .subscribe(shown => (this.showSequentialNumber = shown))
        ];
    }
}
