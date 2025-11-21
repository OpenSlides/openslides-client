import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, filter, firstValueFrom, map, Observable } from 'rxjs';
import { Fqid, Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { Identifiable, Selectable } from 'src/app/domain/interfaces';
import { Action, ActionService } from 'src/app/gateways/actions';
import { BaseComponent } from 'src/app/site/base/base.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import {
    ParticipantSearchSelectorModule,
    UserSelectionData
} from 'src/app/site/pages/meetings/modules/participant-search-selector';
import { ParticipantListSortService } from 'src/app/site/pages/meetings/pages/participants/pages/participant-list/services/participant-list-sort/participant-list-sort.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules';

import { ViewMotionSupporter } from '../../../../../../modules/supporters';
import { MotionSupporterControllerService } from '../../../../../../modules/supporters/services';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service';
import { ViewMotion } from '../../../../../../view-models';

type IdMap = Record<number, number>;

type MotionMeetingUser = Selectable & { fqid?: Fqid; user_id?: Id };

@Component({
    selector: 'os-motion-manage-supporters',
    imports: [
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        ParticipantSearchSelectorModule,
        OpenSlidesTranslationModule,
        CommaSeparatedListingComponent,
        AsyncPipe,
        SortingListModule
    ],
    templateUrl: './motion-manage-supporters.component.html',
    styleUrl: './motion-manage-supporters.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class MotionManageSupportersComponent extends BaseComponent implements OnInit, OnDestroy {
    public get motion(): ViewMotion {
        return this._motion;
    }

    @Input()
    public set motion(value: ViewMotion) {
        this._motion = value;
        this.updateData(this.intermediateModels);
        this.updateSupportersSubject();
    }

    /**
     * Determine if the name of supporters are visible
     */
    public showSupporters = false;

    public minSupporters$ = this.meetingSettingsService.get(`motions_supporters_min_amount`);

    public get validSupporters(): number {
        return this.motion.supporters.filter(g => !this.checkValidSupporter(g)).length;
    }

    public get validSupportersText(): number {
        return this.translate.instant(`of which %num% not permissable`).replace(`%num%`, this.validSupporters);
    }

    public get supportersObservable(): Observable<ViewMotionSupporter[]> {
        return this._supportersSubject;
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    public get intermediateModels(): ViewMotionSupporter[] {
        return this.getIntermediateModels(this.motion);
    }

    public get intermediateModels$(): Observable<ViewMotionSupporter[]> {
        return this.motion[`supporters$`] as unknown as Observable<ViewMotionSupporter[]>;
    }

    /**
     * The current list of intermediate models.
     */
    public readonly editSubject = new BehaviorSubject<MotionMeetingUser[]>([]);
    public nonSelectableUserIds: number[] = [];

    /**
     * The observable from editSubject. Fixing this value is a performance boost, because
     * it is just set one time at loading instead of calling .asObservable() every time.
     */
    public editObservable: Observable<Selectable[]>;

    /**
     * Saves if the users edits the note.
     */
    public set isEditMode(value: boolean) {
        this._editMode = value;
        this._addUsersSet.clear();
        this._removeUsersMap = {};
    }

    public get isEditMode(): boolean {
        return this._editMode;
    }

    private _editMode = false;

    private _motion!: ViewMotion;

    private _addUsersSet = new Set<Id>();
    private _removeUsersMap: IdMap = {};

    private _oldIds = new Set<Id>([]);

    private _supportersSubject = new BehaviorSubject<ViewMotionSupporter[]>([]);

    public constructor(
        private userRepository: ParticipantControllerService,
        public perms: MotionPermissionService,
        private motionController: MotionControllerService,
        private actionService: ActionService,
        public repo: MotionSupporterControllerService,
        private operator: OperatorService,
        private meetingSettingsService: MeetingSettingsService,
        private participantSort: ParticipantListSortService,
        private activeMeetingService: ActiveMeetingService
    ) {
        super();

        this.editObservable = this.editSubject as Observable<Selectable[]>;

        this.subscriptions.push(
            this.participantSort.getSortedViewModelListObservable().subscribe(() => {
                this.updateSupportersSubject();
            })
        );
    }

    public ngOnInit(): void {
        this.participantSort.initSorting();
        this.subscriptions.push(
            this.editSubject.subscribe(
                ids => (this.nonSelectableUserIds = ids.map(model => model.user_id ?? model.id))
            ),
            this.participantSort.getSortedViewModelListObservable().subscribe(() => {
                this.updateSupportersSubject();
            })
        );
    }

    public override ngOnDestroy(): void {
        this.participantSort.exitSortService();
        super.ngOnDestroy();
    }

    /**
     * Supports the motion (as requested user)
     */
    public support(): void {
        this.repo.create(this.motion, this.operator.user).resolve().catch(this.raiseError);
    }

    /**
     * Unsupports the motion
     */
    public unsupport(): void {
        this.repo
            .delete(this.motion.supporters.find(sup => sup.meeting_user.user_id === this.operator.user.id))
            .resolve()
            .catch(this.raiseError);
    }

    /**
     * Opens the dialog with all supporters.
     * TODO: open dialog here!
     */
    public async openSupportersDialog(): Promise<void> {
        await this.updateSupportersSubject();
        this.showSupporters = !this.showSupporters;
    }

    public checkValidSupporter(supporter: ViewMotionSupporter): boolean {
        return (
            supporter.meeting_user?.groups?.filter(g => g.hasPermission(Permission.motionCanSupport)).length > 0 &&
            !(
                supporter.meeting_user?.vote_delegated_to_id &&
                this.activeMeetingService.meeting.users_forbid_delegator_as_supporter &&
                this.activeMeetingService.meeting.users_enable_vote_delegations
            )
        );
    }

    public async onSave(): Promise<void> {
        const actions: Action<any>[] = [];
        if (Object.values(this._removeUsersMap).length > 0) {
            const removeMap = Object.values(this._removeUsersMap).map(id => {
                return { id: id };
            }) as Identifiable[];
            actions.push(this.repo.delete(...removeMap));
        }
        if (this._addUsersSet.size > 0) {
            actions.push(this.repo.create(this.motion, ...Array.from(this._addUsersSet).map(id => ({ id }))));

            if (Object.values(this._removeUsersMap).length > 0) {
                actions[0].setSendActionFn((r, _) => this.actionService.sendRequests(r, true));
            }
        }

        const promise = Promise.all(
            this.editSubject.value.map(val =>
                val.user_id
                    ? val
                    : firstValueFrom(
                          this.motionController.getViewModelObservable(this.motion.id).pipe(
                              map(motion =>
                                  this.getIntermediateModels(motion).find(model => {
                                      if (val instanceof ViewUser) {
                                          return model.user_id === val.id;
                                      }
                                      // else is (val instanceof ViewMotionSubmitter/ViewMotionEditor/ViewMotionWorkingGroupSpeaker)
                                      return model.user_id === val.id;
                                  })
                              ),
                              filter(model => !!model)
                          )
                      )
            )
        );

        await Action.from(...actions).resolve();

        await promise;
        this.isEditMode = false;
    }

    /**
     * Close the edit view.
     */
    public onCancel(): void {
        this.isEditMode = false;
    }

    /**
     * Enter the edit mode and reset the form and the data.
     */
    public onEdit(): void {
        this.isEditMode = true;
        this.editSubject.next(this.intermediateModels);
        this._oldIds = new Set(this.intermediateModels.map(model => model.id));
    }

    public async createNewIntermediateModel(username: string): Promise<void> {
        const newUserObj = await this.userRepository.createFromString(username);
        await this.addUserAsIntermediateModel(newUserObj);
    }

    /**
     * A sort event occures. Saves the new order into the editSubject.
     */
    public onSortingChange(models: MotionMeetingUser[]): void {
        this.editSubject.next(models);
    }

    /**
     * Removes the user from the list.
     */
    public onRemove(model: MotionMeetingUser): void {
        if (model.user_id) {
            this._removeUsersMap[model.id] = model.id;
        } else if (this._addUsersSet.has(model.id)) {
            this._addUsersSet.delete(model.id);
        } else if (model.user_id === undefined) {
            this._removeUsersMap[model.id] = model.id;
        }
        const value = this.editSubject.getValue();
        this.editSubject.next(value.filter(user => user.fqid !== model.fqid));
    }

    public addUser(data: UserSelectionData): void {
        if (data.user) {
            this.addUserAsIntermediateModel(data.user);
        } else {
            this.addUserAsIntermediateModel(this.userRepository.getViewModel(data.userId));
        }
    }

    private async updateSupportersSubject(): Promise<void> {
        this._supportersSubject.next(
            (await this.participantSort.sort(this.motion?.supporterUsers ?? [])).flatMap(
                user => user.getMeetingUser()?.getSupporter(this.motion.id) ?? []
            )
        );
    }

    private updateData(models: ViewMotionSupporter[]): void {
        if (!this.isEditMode) {
            this.editSubject.next(models);
            return;
        }
        const newRemoveMap: IdMap = {};
        const sortMap = new Map(this.editSubject.value.map((model, index) => [this.getUserId(model), index]));
        for (const model of models) {
            if (this._removeUsersMap[model.id]) {
                newRemoveMap[model.id] = model?.id;
            } else if (this._addUsersSet.has(model.id)) {
                this._addUsersSet.delete(model.id);
            }
        }
        this.editSubject.next(
            (models as MotionMeetingUser[])
                .concat(this.editSubject.value.filter(model => model.user_id && this._addUsersSet.has(model.id)))
                .sort((a, b) => {
                    const indexA = sortMap.get(this.getUserId(a));
                    const indexB = sortMap.get(this.getUserId(b));
                    if (indexB === undefined) return -1;
                    if (indexA === undefined) return 1;
                    return indexA - indexB;
                })
        );
        this._removeUsersMap = newRemoveMap;
    }

    private getUserId(model: MotionMeetingUser): number {
        return model.user_id ?? model.id;
    }

    private getIntermediateModels(motion: ViewMotion): ViewMotionSupporter[] {
        return motion.supporters as unknown as ViewMotionSupporter[];
    }

    /**
     * Adds the user to the list, if they aren't already in there.
     */
    private async addUserAsIntermediateModel(model: MotionMeetingUser): Promise<void> {
        let userNumber = model.id;
        if (!model?.user_id || model instanceof ViewUser) {
            if (model instanceof ViewUser) {
                const motionUser = this.getIntermediateModels(this.motion).find(motionUser => {
                    return motionUser.user_id === model.id;
                });
                if (motionUser !== undefined) {
                    userNumber = motionUser.id;
                }
            }
            if (this._oldIds.has(userNumber)) {
                delete this._removeUsersMap[userNumber];
            } else {
                this._addUsersSet.add(userNumber);
            }
        }
        const models = this.editSubject.value;
        this.editSubject.next(models.concat(model));
    }
}
