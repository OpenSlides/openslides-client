import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Selectable } from 'src/app/domain/interfaces';
import { Motion } from 'src/app/domain/models/motions';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { ChangeRecoMode } from 'src/app/domain/models/motions/motions.constants';
import { ViewMotion, ViewMotionCategory, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { ParticipantListSortService } from '../../../../../../../participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionEditorControllerService } from '../../../../../../modules/editors/services';
import { MotionSubmitterControllerService } from '../../../../../../modules/submitters/services';
import { MotionWorkingGroupSpeakerControllerService } from '../../../../../../modules/working-group-speakers/services';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { BaseMotionDetailChildComponent } from '../../../../base/base-motion-detail-child.component';
import { SearchListDefinition } from '../motion-extension-field/motion-extension-field.component';

@Component({
    selector: `os-origin-motion-meta-data`,
    templateUrl: `./origin-motion-meta-data.component.html`,
    styleUrls: [`./origin-motion-meta-data.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OriginMotionMetaDataComponent extends BaseMotionDetailChildComponent implements OnInit, OnDestroy {
    public categories$: Observable<ViewMotionCategory[]> = this.categoryRepo.getViewModelListObservable();
    public tags$: Observable<ViewTag[]> = this.tagRepo.getViewModelListObservable();
    public motionBlocks$: Observable<MotionBlock[]> = this.blockRepo.getViewModelListObservable();

    @Input()
    public changeRecoMode: ChangeRecoMode;

    public expanded = false;

    /**
     * @returns the current recommendation label (with extension)
     */
    public get recommendationLabel(): string {
        return this.repo.getExtendedRecommendationLabel(this.motion);
    }

    public get isRecommendationEnabled(): boolean {
        return !!this.motion.recommendation;
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
            map(motions => motions.naturalSort(this.translate.getCurrentLang(), [`number`, `title`]))
        );
    }

    public get referencedMotions$(): Observable<ViewMotion[]> {
        return this.motion?.recommendation_extension_references$.pipe(
            map(motions => (motions as ViewMotion[]).naturalSort(this.translate.getCurrentLang(), [`number`, `title`]))
        );
    }

    public loadForwardingCommittees: () => Promise<Selectable[]>;

    public get supportersObservable(): Observable<ViewUser[]> {
        return this._supportersSubject;
    }

    private _supportersSubject = new BehaviorSubject<ViewUser[]>([]);

    public constructor(
        protected override translate: TranslateService,
        public perms: MotionPermissionService,
        private motionForwardingService: MotionForwardDialogService,
        private meetingController: MeetingControllerService,
        public motionSubmitterRepo: MotionSubmitterControllerService,
        public motionEditorRepo: MotionEditorControllerService,
        public motionWorkingGroupSpeakerRepo: MotionWorkingGroupSpeakerControllerService,
        private participantSort: ParticipantListSortService
    ) {
        super();
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

    /**
     * Handler for the 'follow recommendation' button
     */
    public onFollowRecButton(): void {
        this.repo.followRecommendation(this.motion);
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
        this._supportersSubject.next(await this.participantSort.sort(this.motion.supporterUsers));
    }

    private isViewMotion(toTest: ViewMotion | ViewMeeting): boolean {
        return toTest.COLLECTION === Motion.COLLECTION;
    }
}
