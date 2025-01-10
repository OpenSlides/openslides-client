import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Selectable } from 'src/app/domain/interfaces';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { Motion } from 'src/app/domain/models/motions';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { GetForwardingCommitteesPresenterService } from 'src/app/gateways/presenter/get-forwarding-committees-presenter.service';
import { ViewMotion, ViewMotionCategory, ViewMotionState, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ParticipantListSortService } from '../../../../../../../participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionEditorControllerService } from '../../../../../../modules/editors/services';
import { MotionSubmitterControllerService } from '../../../../../../modules/submitters/services';
import { MotionWorkingGroupSpeakerControllerService } from '../../../../../../modules/working-group-speakers/services';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { SearchListDefinition } from '../motion-extension-field/motion-extension-field.component';

@Component({
    selector: `os-motion-meta-data`,
    templateUrl: `./motion-meta-data.component.html`,
    styleUrls: [`./motion-meta-data.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionMetaDataComponent extends BaseMotionDetailChildComponent implements OnInit, OnDestroy {
    public categories$: Observable<ViewMotionCategory[]> = this.categoryRepo.getViewModelListObservable();
    public tags$: Observable<ViewTag[]> = this.tagRepo.getViewModelListObservable();
    public motionBlocks$: Observable<MotionBlock[]> = this.blockRepo.getViewModelListObservable();

    @Input()
    public changeRecoMode: ChangeRecoMode;

    /**
     * Determine if the name of supporters are visible
     */
    public showSupporters = false;

    public minSupporters$ = this.meetingSettingsService.get(`motions_supporters_min_amount`);
    public showReferringMotions$ = this.meetingSettingsService.get(`motions_show_referring_motions`);

    /**
     * @returns the current recommendation label (with extension)
     */
    public get recommendationLabel(): string {
        return this.repo.getExtendedRecommendationLabel(this.motion);
    }

    public get isRecommendationEnabled(): boolean {
        return (
            (this.perms.isAllowed(`change_metadata`) || !!this.motion.recommendation) &&
            !!this.recommender &&
            !!this.getPossibleRecommendations().length
        );
    }

    /**
     * @returns the current state label (with extension)
     */
    public get stateLabel(): string {
        return this.repo.getExtendedStateLabel(this.motion);
    }

    public get isDifferedChangeRecoMode(): boolean {
        return this.changeRecoMode === ChangeRecoMode.Diff;
    }

    /**
     * Custom recommender as set in the settings
     */
    public recommender: string | null = null;

    public searchLists: SearchListDefinition[] = [
        {
            observable: this.repo.getViewModelListObservable(),
            label: `Motions`
        },
        {
            observable: this.motionForwardingService.forwardingCommitteesObservable,
            label: `Committees`,
            keepOpen: true,
            wider: true
        }
    ];

    public motionTransformFn = (value: ViewMotion): string => `[${value.fqid}]`;

    public get referencingMotions$(): Observable<ViewMotion[]> {
        return this.motion?.referenced_in_motion_recommendation_extensions$.pipe(
            map(motions => motions.naturalSort(this.translate.currentLang, [`number`, `title`]))
        );
    }

    public get referencedMotions$(): Observable<ViewMotion[]> {
        return this.motion?.recommendation_extension_references$.pipe(
            map(motions => (motions as ViewMotion[]).naturalSort(this.translate.currentLang, [`number`, `title`]))
        );
    }

    public get originMotions$(): Observable<ViewMotion[] | ViewMeeting[]> {
        if (this.motion.origin_id) {
            return this.motion.all_origins$.pipe(map(origins => origins?.reverse()));
        } else if (this.motion.origin_meeting_id) {
            return this.motion.origin_meeting$.pipe(map(origin => [origin]));
        }
        return null;
    }

    public override get showAllAmendments(): boolean {
        return this.viewService.currentShowAllAmendmentsState;
    }

    public override set showAllAmendments(is: boolean) {
        this.viewService.showAllAmendmentsStateSubject.next(is);
    }

    public get showForwardButton(): boolean {
        return (
            !!this.motion.state?.allow_motion_forwarding &&
            this.operator.hasPerms(Permission.motionCanForward) &&
            this._forwardingAvailable &&
            !this.motion.derived_motions.length
        );
    }

    public loadForwardingCommittees: () => Promise<Selectable[]>;

    private _forwardingAvailable = false;

    public get supportersObservable(): Observable<ViewUser[]> {
        return this._supportersSubject;
    }

    private _supportersSubject = new BehaviorSubject<ViewUser[]>([]);

    /**
     * The subscription to the recommender config variable.
     */
    private recommenderSubscription: Subscription | null = null;

    public constructor(
        protected override translate: TranslateService,
        public perms: MotionPermissionService,
        private operator: OperatorService,
        private motionForwardingService: MotionForwardDialogService,
        private meetingController: MeetingControllerService,
        public motionSubmitterRepo: MotionSubmitterControllerService,
        public motionEditorRepo: MotionEditorControllerService,
        public motionWorkingGroupSpeakerRepo: MotionWorkingGroupSpeakerControllerService,
        private participantSort: ParticipantListSortService,
        private presenter: GetForwardingCommitteesPresenterService
    ) {
        super();

        if (operator.hasPerms(Permission.motionCanManageMetadata)) {
            this.motionForwardingService.forwardingMeetingsAvailable().then(forwardingAvailable => {
                this._forwardingAvailable = forwardingAvailable;
                this.cd.markForCheck();
                this.loadForwardingCommittees = async (): Promise<Selectable[]> => {
                    return (await this.checkPresenter()) as Selectable[];
                };
            });
        } else {
            this._forwardingAvailable = false;
        }
    }

    public ngOnInit(): void {
        this.participantSort.initSorting();

        this.subscriptions.push(
            this.participantSort.getSortedViewModelListObservable().subscribe(() => this.updateSupportersSubject())
        );
    }

    public override ngOnDestroy(): void {
        this.participantSort.exitSortService();
        super.ngOnDestroy();
    }

    protected override onAfterInit(): void {
        this.setupRecommender();
    }

    protected override onAfterSetMotion(previous: ViewMotion, current: ViewMotion): void {
        super.onAfterSetMotion(previous, current);
        this.updateSupportersSubject();
    }

    /**
     * Sets the state
     *
     * @param id Motion state id
     */
    public setState(id: number): void {
        this.repo.setState(id, this.motion).resolve();
    }

    public resetState(): void {
        this.repo.resetState(this.motion).resolve();
    }

    /**
     * triggers the update this motion's state extension according to the current string
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
        this.repo.setRecommendation(id, this.motion)?.resolve();
    }

    public resetRecommendation(): void {
        this.repo.resetRecommendation(this.motion).resolve();
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
    public setCategory(id: number | null): void {
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
    public setBlock(id: number | null): void {
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

    public getCategorySelectionMarginLeft(category: ViewMotionCategory): string {
        return (
            (!this.motion.category_id || this.motion.category_id === category.id ? 0 : 32) + category.level * 5 + `px`
        );
    }

    /**
     * Check if a recommendation can be followed. Checks for permissions and additionally if a recommentadion is present
     */
    public canFollowRecommendation(): boolean {
        return this.perms.isAllowed(`createpoll`, this.motion) && !!this.motion.recommendation?.recommendation_label;
    }

    public async forwardMotionToMeetings(): Promise<void> {
        await this.motionForwardingService.forwardMotionsToMeetings(this.motion);
    }

    /**
     * Handler for the 'follow recommendation' button
     */
    public onFollowRecButton(): void {
        this.repo.followRecommendation(this.motion);
    }

    public getPossibleRecommendations(): ViewMotionState[] {
        const allStates = this.motion.state?.workflow?.states || [];
        return allStates.filter(state => state.recommendation_label).sort((a, b) => a.weight - b.weight);
    }

    public getMeetingName(origin: ViewMotion | ViewMeeting): string {
        if (this.isViewMotion(origin)) {
            const motion = origin as ViewMotion;
            return motion.meeting?.name ?? this.meetingController.getViewModelUnsafe(motion.meeting_id)?.name;
        }
        return (origin as ViewMeeting)?.name;
    }

    public getUrl(origin: ViewMotion | ViewMeeting): string {
        if (this.isViewMotion(origin)) {
            const motion = origin as ViewMotion;
            return motion.getDetailStateUrl();
        }
        return `/${(origin as ViewMeeting).id}/motions`;
    }

    public canAccess(origin: ViewMotion | ViewMeeting): boolean {
        if (this.isViewMotion(origin)) {
            const motion = origin as ViewMotion;
            return motion.sequential_number && motion.meeting?.canAccess();
        }
        return origin?.canAccess();
    }

    private async updateSupportersSubject(): Promise<void> {
        this._supportersSubject.next(await this.participantSort.sort(this.motion.supporters));
    }

    private isViewMotion(toTest: ViewMotion | ViewMeeting): boolean {
        return toTest.COLLECTION === Motion.COLLECTION;
    }

    /**
     * Observes the repository for changes in the motion recommender
     */
    private setupRecommender(): void {
        if (this.motion) {
            const configKey: keyof Settings = `motions_recommendations_by`;
            if (this.recommenderSubscription) {
                this.recommenderSubscription.unsubscribe();
            }
            this.recommenderSubscription = this.meetingSettingsService.get(configKey).subscribe(recommender => {
                this.recommender = recommender;
            });
        }
    }

    private async checkPresenter(): Promise<(Selectable & { name: string; toString: any })[]> {
        const meetingId = this.activeMeetingService.meetingId;
        const committees =
            this.operator.hasPerms(Permission.motionCanManageMetadata) && !!meetingId
                ? await this.presenter.call({ meeting_id: meetingId })
                : [];
        const forwardingCommittees: (Selectable & { name: string; toString: any })[] = [];
        for (let n = 0; n < committees.length; n++) {
            forwardingCommittees.push({
                id: n + 1,
                name: committees[n],
                getTitle: () => committees[n],
                getListTitle: () => ``,
                toString: () => committees[n]
            });
        }

        return forwardingCommittees;
    }
}
