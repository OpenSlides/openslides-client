import { Component, Input, OnInit } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { Tag } from 'app/shared/models/core/tag';
import { Settings } from 'app/shared/models/event-management/meeting';
import { MotionBlock } from 'app/shared/models/motions/motion-block';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { MotionViewService } from '../../../services/motion-view.service';

@Component({
    selector: 'os-motion-meta-data',
    templateUrl: './motion-meta-data.component.html',
    styleUrls: ['./motion-meta-data.component.scss']
})
export class MotionMetaDataComponent extends BaseComponent implements OnInit {
    @Input()
    public motion: ViewMotion;

    public motionBlocks: MotionBlock[] = [];

    public categories: ViewMotionCategory[] = [];

    public tags: Tag[] = [];

    public recommendationReferencingMotions: ViewMotion[] = [];

    public showReferringMotions = false;

    /**
     * Value of the config variable `motions_min_supporters`
     */
    // public minSupporters: number;
    /**
     * TODO service does not exist
     */
    public minSupporters = 1;

    /**
     * Determine if the name of supporters are visible
     */
    public showSupporters = false;

    /**
     * new state extension label to be submitted, if state extensions can be set
     */
    public newStateExtension = '';

    /**
     * State extension label for the recommendation.
     */
    public recommendationStateExtension = '';

    /**
     * @returns the current recommendation label (with extension)
     */
    public get recommendationLabel(): string {
        return this.repo.getExtendedRecommendationLabel(this.motion);
    }

    /**
     * @returns the current state label (with extension)
     */
    public get stateLabel(): string {
        return this.repo.getExtendedStateLabel(this.motion);
    }

    public get isDifferedChangeRecoMode(): boolean {
        return this.viewService.currentChangeRecommendationMode === ChangeRecoMode.Diff;
    }

    /**
     * Custom recommender as set in the settings
     */
    public recommender: string;

    public motionObserver: Observable<ViewMotion[]>;

    /**
     * All amendments to this motion
     */
    public amendments: ViewMotion[];

    public showAllAmendments = false;

    private tagObserver: Observable<Tag[]>;
    private blockObserver: Observable<MotionBlock[]>;
    private categoryObserver: Observable<ViewMotionCategory[]>;

    /**
     * The subscription to the recommender config variable.
     */
    private recommenderSubscription: Subscription;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private repo: MotionRepositoryService,
        private categoryRepo: MotionCategoryRepositoryService,
        private tagRepo: TagRepositoryService,
        private blockRepo: MotionBlockRepositoryService,
        public perms: PermissionsService,
        private viewService: MotionViewService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.initObserver();
        this.subscriptions.push(
            ...this.subscribeToViewModelLists(),
            ...this.subscribeToMetaData(),
            ...this.subscribeToConfigVariables()
        );
    }

    /**
     * Sets the state
     *
     * @param id Motion state id
     */
    public setState(id: number): void {
        this.repo.setState(this.motion, id);
    }

    public resetState(): void {
        this.repo.resetState(this.motion);
    }

    /**
     * triggers the update this motion's state extension according to the current string
     * in {@link newStateExtension}
     */
    public setStateExtension(nextExtension: string): void {
        this.repo.setStateExtension(this.motion, nextExtension);
    }

    /**
     * Sets the recommendation
     *
     * @param id Motion recommendation id
     */
    public setRecommendation(id: number): void {
        this.repo.setRecommendation(this.motion, id);
    }

    public resetRecommendation(): void {
        this.repo.resetRecommendation(this.motion);
    }

    /**
     * triggers the update this motion's recommendation extension according to the current string
     * in {@link newRecommendationExtension}
     */
    public setRecommendationExtension(nextExtension: string): void {
        this.repo.setRecommendationExtension(this.motion, nextExtension);
    }

    /**
     * Sets the category for current motion
     *
     * @param id Motion category id
     */
    public setCategory(id: number): void {
        if (id === this.motion.category_id) {
            id = null;
        }
        this.repo.setCategory(this.motion, id);
    }

    /**
     * Adds or removes a tag to the current motion
     *
     * @param {MouseEvent} event
     * @param {number} id Motion tag id
     */
    public setTag(event: MouseEvent, id: number): void {
        event.stopPropagation();
        this.repo.toggleTag(this.motion, id);
    }

    /**
     * Add the current motion to a motion block
     *
     * @param id Motion block id
     */
    public setBlock(id: number): void {
        if (id === this.motion.block_id) {
            id = null;
        }
        this.repo.setBlock(this.motion, id);
    }

    /**
     * Supports the motion (as requested user)
     */
    public support(): void {
        this.repo.support(this.motion).catch(this.raiseError);
    }

    /**
     * Unsupports the motion
     */
    public unsupport(): void {
        this.repo.unsupport(this.motion).catch(this.raiseError);
    }

    /**
     * Opens the dialog with all supporters.
     * TODO: open dialog here!
     */
    public openSupportersDialog(): void {
        this.showSupporters = !this.showSupporters;
    }

    /**
     * Observes the repository for changes in the motion recommender
     */
    public setupRecommender(): void {
        if (this.motion) {
            const configKey: keyof Settings = this.motion.isStatuteAmendment()
                ? 'motions_statute_recommendations_by'
                : 'motions_recommendations_by';
            if (this.recommenderSubscription) {
                this.recommenderSubscription.unsubscribe();
            }
            this.recommenderSubscription = this.meetingSettingsService.get(configKey).subscribe(recommender => {
                this.recommender = recommender;
            });
        }
    }

    /**
     * Check if a recommendation can be followed. Checks for permissions and additionally if a recommentadion is present
     */
    public canFollowRecommendation(): boolean {
        return (
            this.perms.isAllowed('createpoll', this.motion) &&
            this.motion.recommendation &&
            !!this.motion.recommendation.recommendation_label
        );
    }

    /**
     * Handler for the 'follow recommendation' button
     */
    public onFollowRecButton(): void {
        this.repo.followRecommendation(this.motion);
    }

    public getPossibleRecommendations(): ViewMotionState[] {
        const allStates = this.motion.state.workflow.states;
        return allStates.filter(state => state.recommendation_label);
    }

    private initObserver(): void {
        this.motionObserver = this.repo.getViewModelListObservable();
        this.tagObserver = this.tagRepo.getViewModelListObservable();
        this.categoryObserver = this.categoryRepo.getViewModelListObservable();
        this.blockObserver = this.blockRepo.getViewModelListObservable();
    }

    private subscribeToViewModelLists(): Subscription[] {
        return [
            this.tagObserver.subscribe(value => (this.tags = value)),
            this.blockObserver.subscribe(value => (this.motionBlocks = value)),
            this.categoryObserver.subscribe(value => (this.categories = value))
        ];
    }

    private subscribeToMetaData(): Subscription[] {
        return [
            this.repo
                .getRecommendationReferencingMotions(this.motion?.id)
                ?.subscribe(motions => (this.recommendationReferencingMotions = motions))
        ];
    }

    private subscribeToConfigVariables(): Subscription[] {
        return [
            this.meetingSettingsService
                .get('motions_supporters_min_amount')
                .subscribe(supporters => (this.minSupporters = supporters)),
            this.meetingSettingsService
                .get('motions_show_referring_motions')
                .subscribe(show => (this.showReferringMotions = show))
        ];
    }
}
