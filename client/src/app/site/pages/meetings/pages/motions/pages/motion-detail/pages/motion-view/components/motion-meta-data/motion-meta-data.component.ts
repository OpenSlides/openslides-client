import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Id } from '@app/domain/definitions/key-types';
import { Permission } from '@app/domain/definitions/permission';
import { Selectable } from '@app/domain/interfaces';
import { Settings } from '@app/domain/models/meetings/meeting';
import { Motion } from '@app/domain/models/motions';
import { MotionBlock } from '@app/domain/models/motions/motion-block';
import { ChangeRecoMode } from '@app/domain/models/motions/motions.constants';
import { GetForwardingCommitteesPresenterService } from '@app/gateways/presenter/get-forwarding-committees-presenter.service';
import { MotionRepositoryService } from '@app/gateways/repositories/motions/motion-repository.service';
import { ViewMotion, ViewMotionCategory, ViewMotionState, ViewTag } from '@app/site/pages/meetings/pages/motions';
import { MeetingControllerService } from '@app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';
import { OperatorService } from '@app/site/services/operator.service';
import { _ } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, of, Subscription } from 'rxjs';

import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionEditorControllerService } from '../../../../../../modules/editors/services/motion-editor-controller/motion-editor-controller.service';
import { MotionSubmitterControllerService } from '../../../../../../modules/submitters/services/motion-submitter-controller/motion-submitter-controller.service';
import { MotionWorkingGroupSpeakerControllerService } from '../../../../../../modules/working-group-speakers/services/motion-working-group-speaker-controller/motion-working-group-speaker-controller.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { SearchListDefinition } from '../motion-extension-field/motion-extension-field.component';

@Component({
    selector: `os-motion-meta-data`,
    templateUrl: `./motion-meta-data.component.html`,
    styleUrls: [`./motion-meta-data.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionMetaDataComponent extends BaseMotionDetailChildComponent implements OnInit, OnDestroy {
    public categories$: Observable<ViewMotionCategory[]> = this.categoryRepo.getViewModelListObservable();
    public tags$: Observable<ViewTag[]> = this.tagRepo.getViewModelListObservable();
    public motionBlocks$: Observable<MotionBlock[]> = this.blockRepo.getViewModelListObservable();

    @Input()
    public changeRecoMode: ChangeRecoMode;

    @Input()
    public activeOriginMotions: ViewMotion[];

    @Input()
    public showForwardButton = false;

    @Output()
    public enableOriginMotion = new EventEmitter<Id>();

    @Output()
    public disableOriginMotion = new EventEmitter<Id>();

    @Output()
    public setShowAllAmendments = new EventEmitter<boolean>();

    public originMotionStatus: Record<number, boolean> = {};

    public showReferringMotions$ = this.meetingSettingsService.get(`motions_show_referring_motions`);
    public originToggleDefault$ = this.meetingSettingsService
        .get(`motions_origin_motion_toggle_default`)
        .pipe(map(v => !!v));

    public displayOriginEnabled$ = this.meetingSettingsService
        .get(`motions_enable_origin_motion_display`)
        .pipe(map(v => !!v));

    // TODO: Use actual setting
    private displayFutureForward = false;
    public displayFutureForward$ = this.meetingSettingsService
        .get(`motions_enable_origin_motion_display`)
        .pipe(map(v => !!v));

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

    public motionTransformFn = (value: ViewMotion): string => `[${value.fqid}]`;

    public get referencingMotions$(): Observable<ViewMotion[]> {
        return this.motion?.referenced_in_motion_recommendation_extensions$.pipe(
            map(motions => motions.naturalSort(this.translate.getCurrentLang() ?? `en`, [`number`, `title`]))
        );
    }

    public get referencedMotions$(): Observable<ViewMotion[]> {
        return this.motion?.recommendation_extension_references$.pipe(
            map(motions =>
                (motions as ViewMotion[]).naturalSort(this.translate.getCurrentLang() ?? `en`, [`number`, `title`])
            )
        );
    }

    public currentOriginPage = new BehaviorSubject<ViewMotion[]>([]);
    private originTreeData: ViewMotion[][] = [];
    private originSubject = new BehaviorSubject<ViewMotion[][]>([]);

    public get originMotions$(): Observable<ViewMotion[][]> {
        return of(this.originTreeData);
    }

    public refreshOriginMotions(): void {
        this.displayFutureForward = true; // TODO: remove this line
        const futureList: ViewMotion[] =
            this.displayFutureForward && this.motion.all_derived_motions ? this.motion.all_derived_motions : [];
        const pastList: ViewMotion[] =
            this.displayFutureForward || this.motion.origin_id ? this.motion.all_origins : [];

        if (this.displayFutureForward) {
            if (futureList.length > 0 || pastList.length > 0) {
                futureList.push(this.motion);
            }
            const origin_ids: number[] = [];

            for (const motion of futureList) {
                if (motion.origin_id && !origin_ids.includes(motion.origin_id) && this.motion !== motion) {
                    const originMotion = this.motionRepo.getViewModel(motion.origin_id);
                    if (originMotion) {
                        futureList.push(originMotion);
                    }
                }
                if (motion.origin_id) {
                    origin_ids.push(motion.origin_id);
                }
            }
        }
        const tree = this.createForwardTree(futureList, pastList);
        this.originTreeData = tree;
        this.originSubject.next(tree);
        if (this.originTreeData.length > 0 && this.currentOriginPage.getValue().length === 0) {
            this.currentOriginPage.next(this.originTreeData[0]);
        }
    }

    public set showAllAmendments(is: boolean) {
        this.setShowAllAmendments.emit(is);
    }

    public get operatorIsSubmitter(): boolean {
        return (
            this.motion.submitters &&
            this.motion.submitters.some(submitter => submitter.user_id === this.operator.operatorId)
        );
    }

    public loadForwardingCommittees: () => Promise<Selectable[]>;

    /**
     * The subscription to the recommender config variable.
     */
    private recommenderSubscription: Subscription | null = null;

    public perms = inject(MotionPermissionService);
    public motionSubmitterRepo = inject(MotionSubmitterControllerService);
    public motionEditorRepo = inject(MotionEditorControllerService);
    public motionWorkingGroupSpeakerRepo = inject(MotionWorkingGroupSpeakerControllerService);
    private motionRepo = inject(MotionRepositoryService);
    private operator = inject(OperatorService);
    private motionForwardingService = inject(MotionForwardDialogService);
    private meetingController = inject(MeetingControllerService);
    private presenter = inject(GetForwardingCommitteesPresenterService);

    public searchLists: SearchListDefinition[] = [
        {
            observable: this.repo.getViewModelListObservable(),
            label: _(`Motions`)
        },
        {
            observable: this.motionForwardingService.forwardingCommitteesObservable,
            label: _(`Committees`),
            keepOpen: true,
            wider: true
        }
    ];

    public constructor() {
        super();

        if (this.operator.hasPerms(Permission.motionCanManageMetadata)) {
            this.motionForwardingService.forwardingMeetingsAvailable().then(_forwardingAvailable => {
                this.loadForwardingCommittees = async (): Promise<Selectable[]> => {
                    return (await this.checkPresenter()) as Selectable[];
                };
            });
        }
    }

    private derivedMotionSubscriptions: Subscription[] = [];

    public ngOnInit(): void {
        for (const motion of this.activeOriginMotions) {
            this.originMotionStatus[motion.id] = true;
        }

        this.derivedMotionSubscriptions.push(
            this.motion.all_derived_motions$.subscribe(_ => this.refreshOriginMotions()),
            this.displayFutureForward$.subscribe((v: boolean) => {
                this.displayFutureForward = v;
            })
        );
    }

    protected override onAfterInit(): void {
        this.setupRecommender();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();

        for (const subscription of this.derivedMotionSubscriptions) {
            subscription.unsubscribe();
        }
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

    public toggleOriginMotion(e: { checked: boolean }, id: Id): void {
        if (e.checked) {
            this.enableOriginMotion.emit(id);
        } else {
            this.disableOriginMotion.emit(id);
        }
    }

    public onPageChange(event: PageEvent): void {
        const page = this.originTreeData[event.pageIndex];
        if (page) {
            this.currentOriginPage.next(page);
        }
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

    public getSortedNextStates(states: ViewMotionState[]): ViewMotionState[] {
        return states.sort((a, b) => a.weight - b.weight);
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

    public canView(origin: ViewMotion | ViewMeeting): boolean {
        if (this.isViewMotion(origin)) {
            const motion = origin as ViewMotion;
            return motion.sequential_number !== undefined;
        }

        return origin?.canAccess();
    }

    public getToolTip(motion: ViewMotion): string {
        let toolTip = ``;
        if (motion.meeting?.location) {
            toolTip = this.translate.instant(`Meeting location`) + `: ` + motion.meeting.location + ` `;
        }
        if (motion.meeting?.start_time) {
            toolTip +=
                this.translate.instant(`Meeting start time`) +
                `: ` +
                this.meetingController.parseUnixToMeetingTime(motion.meeting?.start_time * 1000) +
                ` `;
        }
        if (motion.meeting?.end_time) {
            toolTip +=
                this.translate.instant(`Meeting end time`) +
                `: ` +
                this.meetingController.parseUnixToMeetingTime(motion.meeting?.end_time * 1000) +
                ` `;
        }
        return toolTip;
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

    private createForwardTree(list: ViewMotion[], origins: ViewMotion[]): ViewMotion[][] {
        const childrenIds = new Set(list.filter(motion => !!motion.origin_id).map(motion => motion.origin_id));
        const leaves = list.filter(motion => !childrenIds.has(motion.id));
        const tree: ViewMotion[][] = [];

        for (const leaf of leaves) {
            const branch: ViewMotion[] = [];
            let currentId: number | null = leaf.id;

            while (currentId !== null) {
                const motion = list.find(m => m.id === currentId);
                if (!motion) break;

                branch.push(motion);
                currentId = motion.origin_id;
            }

            branch.push(...origins.reverse());
            tree.push(branch);
        }
        return tree;
    }
}
