import { Component } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Settings } from 'app/shared/models/event-management/meeting';
import { MotionBlock } from 'app/shared/models/motions/motion-block';
import { Tag } from 'app/shared/models/tag/tag';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ChangeRecoMode } from 'app/site/motions/motions.constants';
import { PermissionsService } from 'app/site/motions/services/permissions.service';
import { BaseMotionDetailChildComponent } from '../base/base-motion-detail-child.component';
import { MotionServiceCollectorService } from '../../../services/motion-service-collector.service';

@Component({
    selector: 'os-motion-meta-data',
    templateUrl: './motion-meta-data.component.html',
    styleUrls: ['./motion-meta-data.component.scss']
})
export class MotionMetaDataComponent extends BaseMotionDetailChildComponent {
    public motionBlocks: MotionBlock[] = [];

    public categories: ViewMotionCategory[] = [];

    public tags: Tag[] = [];

    public recommendationReferencingMotions: ViewMotion[] = [];

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
        return this.motionService.getExtendedRecommendationLabel(this.motion);
    }

    public get isRecommendationEnabled(): boolean {
        return (
            (this.perms.isAllowed('change_metadata') || this.motion.recommendation) &&
            this.recommender &&
            !!this.getPossibleRecommendations().length
        );
    }

    /**
     * @returns the current state label (with extension)
     */
    public get stateLabel(): string {
        return this.motionService.getExtendedStateLabel(this.motion);
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

    public set showAllAmendments(is: boolean) {
        this.viewService.showAllAmendmentsStateSubject.next(is);
    }

    /**
     * The subscription to the recommender config variable.
     */
    private recommenderSubscription: Subscription;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        motionServiceCollector: MotionServiceCollectorService,
        public perms: PermissionsService
    ) {
        super(componentServiceCollector, motionServiceCollector);
    }

    /**
     * Sets the state
     *
     * @param id Motion state id
     */
    public setState(id: number): void {
        this.repo.setState(id, this.motion);
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
        this.repo.setRecommendation(id, this.motion);
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
        this.repo.setCategory(id, this.motion);
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
        this.repo.setBlock(id, this.motion);
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
        const allStates = this.motion.state?.workflow?.states || [];
        return allStates.filter(state => state.recommendation_label);
    }

    public getOriginMotions(): ViewMotion[] {
        const copy = [...(this.motion.all_origins || [])];
        return copy.reverse();
    }

    protected getSubscriptions(): Subscription[] {
        return [
            this.repo.getAmendmentsByMotionAsObservable(this.motion.id).subscribe(value => (this.amendments = value)),
            this.tagRepo.getViewModelListObservable().subscribe(value => (this.tags = value)),
            this.categoryRepo.getViewModelListObservable().subscribe(value => (this.categories = value)),
            this.blockRepo.getViewModelListObservable().subscribe(value => (this.motionBlocks = value)),
            this.motionService
                .getRecommendationReferencingMotions(this.motion?.id)
                ?.subscribe(motions => (this.recommendationReferencingMotions = motions))
        ];
    }

    protected onAfterInit(): void {
        this.motionObserver = this.repo.getViewModelListObservable();
        this.setupRecommender();
    }

    /**
     * Observes the repository for changes in the motion recommender
     */
    private setupRecommender(): void {
        if (this.motion) {
            const configKey: keyof Settings = this.motion.isStatuteAmendment()
                ? 'motions_statute_recommendations_by'
                : 'motions_recommendations_by';
            if (this.recommenderSubscription) {
                this.recommenderSubscription.unsubscribe();
            }
            this.recommenderSubscription = this.meetingSettingService.get(configKey).subscribe(recommender => {
                this.recommender = recommender;
            });
        }
    }
}
