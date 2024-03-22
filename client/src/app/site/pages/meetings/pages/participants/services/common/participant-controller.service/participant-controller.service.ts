import { Injectable } from '@angular/core';
import {
    auditTime,
    BehaviorSubject,
    combineLatest,
    filter,
    firstValueFrom,
    map,
    Observable,
    of,
    Subscription,
    switchAll,
    tap
} from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { User } from 'src/app/domain/models/users/user';
import { Action, ActionService } from 'src/app/gateways/actions';
import { GetUserRelatedModelsPresenterService, GetUserScopePresenterService } from 'src/app/gateways/presenter';
import { MeetingUserRepositoryService } from 'src/app/gateways/repositories/meeting_user';
import {
    ExtendedUserPatchFn,
    FullNameInformation,
    RawUser,
    UserPatchFn,
    UserRepositoryService,
    UserStateField
} from 'src/app/gateways/repositories/users';
import { UserAction } from 'src/app/gateways/repositories/users/user-action';
import { toDecimal } from 'src/app/infrastructure/utils';
import { UserDeleteDialogService } from 'src/app/site/modules/user-components';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { UserService } from 'src/app/site/services/user.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { ParticipantCommonServiceModule } from '../participant-common-service.module';

export const MEETING_RELATED_FORM_CONTROLS = [
    `structure_level_ids`,
    `number`,
    `vote_weight`,
    `about_me`,
    `comment`,
    `group_ids`,
    `vote_delegations_from_ids`,
    `vote_delegated_to_id`,
    `is_present`
];

@Injectable({
    providedIn: ParticipantCommonServiceModule
})
export class ParticipantControllerService extends BaseMeetingControllerService<ViewUser, User> {
    private _participantListSubject = new BehaviorSubject<ViewUser[]>([]);

    private _participantListUpdateSubscription: Subscription;

    private _participantIdMapSubject = new BehaviorSubject<{ [id: number]: ViewUser }>({});

    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private meetingUserRepo: MeetingUserRepositoryService,
        public meetingController: MeetingControllerService,
        private userController: UserControllerService,
        private userDeleteDialog: UserDeleteDialogService,
        private userScopePresenter: GetUserScopePresenterService,
        private userRelatedModelsPresenter: GetUserRelatedModelsPresenterService,
        private userService: UserService,
        private actions: ActionService
    ) {
        super(controllerServiceCollector, User, repo);

        let meetingUserIds = [];
        this.activeMeetingIdService.meetingIdObservable
            .pipe(
                tap(() => {
                    if (this._participantListUpdateSubscription) {
                        this._participantListUpdateSubscription.unsubscribe();
                    }
                }),
                map(newId => {
                    return newId ? this.meetingController.getViewModelObservable(newId) : of();
                }),
                switchAll()
            )
            .subscribe(meeting => {
                meetingUserIds = meeting?.meeting_user_ids ?? [];
                this.updateUsersFromMeetingUsers(this.meetingUserRepo.getViewModelList() ?? [], meetingUserIds);
            });

        this.meetingUserRepo.getViewModelListObservable().subscribe(async mUsers => {
            this.updateUsersFromMeetingUsers(mUsers, meetingUserIds);
        });
    }

    private async updateUsersFromMeetingUsers(mUsers: ViewMeetingUser[], meetingUserIds?: number[]): Promise<void> {
        const meetingUsers = mUsers.filter(
            mUser =>
                mUser.meeting_id === this.activeMeetingId &&
                mUser.group_ids?.length &&
                meetingUserIds.includes(mUser.id)
        );
        const users = meetingUsers.map(mUser => mUser?.user).filter(user => user);
        this._participantIdMapSubject.next(users.mapToObject(user => ({ [user.id]: user })));
        this._participantListSubject.next(users);
    }

    public override getViewModelList(): ViewUser[] {
        return this._participantListSubject.value;
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return this._participantListSubject;
    }

    public override getSortedViewModelList(key?: string): ViewUser[] {
        return this.userController
            .getSortedViewModelList(key)
            .filter(user => this._participantIdMapSubject.value[user.id]);
    }

    public override getSortedViewModelListObservable(key?: string): Observable<ViewUser[]> {
        return combineLatest([
            this._participantIdMapSubject,
            this.userController.getSortedViewModelListObservable(key)
        ]).pipe(
            auditTime(1),
            map(([idMap, sortedUsers]) => {
                return sortedUsers.filter(user => idMap[user.id]);
            })
        );
    }

    public override getViewModelObservable(id: Id): Observable<ViewUser | null> {
        return this.repo.getViewModelObservable(id).pipe(
            map(user => {
                if (!user?.meeting_users) {
                    return of(user);
                }

                return this.meetingUserRepo
                    .getViewModelObservable(user.meeting_users.find(u => u.meeting_id === this.activeMeetingId).id)
                    .pipe(
                        filter(u => !!u),
                        map(u => u.user)
                    );
            }),
            switchAll()
        );
    }

    public create(
        ...participants: Partial<User & MeetingUser>[]
    ): Promise<(Identifiable & { meeting_user_id?: Id })[]> {
        return this.repo.create(...participants.map(participant => this.validatePayload(participant)));
    }

    public update(patch: ExtendedUserPatchFn, ...users: ViewUser[]): Action<void> {
        if (typeof patch === `function`) {
            const updatePatch = (user: ViewUser) => {
                const participantPayload = patch(user);
                return this.validatePayload(participantPayload);
            };
            return this.repo.update(updatePatch, ...users);
        }
        return this.repo.update(this.validatePayload(patch as Partial<ViewUser>), ...users);
    }

    public updateSelf(patch: UserPatchFn, participant: ViewUser): Promise<void> {
        return this.repo.updateSelf(patch, participant);
    }

    public delete(participants: Identifiable[], handle_separately = false): Action<void> {
        return this.repo.delete(participants, handle_separately) as Action<void>;
    }

    public bulkGenerateNewPasswords(...users: ViewUser[]): Promise<void> {
        return this.repo.bulkGenerateNewPasswords(users);
    }

    public resetPasswordToDefault(...users: Identifiable[]): Promise<void> {
        return this.repo.resetPasswordToDefault(users);
    }

    public setPassword(user: Identifiable, password: string, useAsDefault?: boolean): Promise<void> {
        return this.repo.setPassword(user, password, useAsDefault);
    }

    public setPasswordSelf(user: Identifiable, newPassword: string, oldPassword: string): Promise<void> {
        return this.repo.setPasswordSelf(user, oldPassword, newPassword);
    }

    public jsonUpload(payload: { [key: string]: any }): Action<BackendImportRawPreview> {
        return this.repo.participantJsonUpload(payload);
    }

    public import(payload: { id: number; import: boolean }[]): Action<BackendImportRawPreview | void> {
        return this.repo.participantImport(payload);
    }

    /**
     * Should determine if the user (Operator) has the
     * correct permission to perform the given action.
     *
     * actions might be:
     * - delete         (deleting the user) (users.can_manage and not ownPage)
     * - seeName        (title, first, last, gender, about) (user.can_see_name or ownPage)
     * - seeOtherUsers  (title, first, last, gender, about) (user.can_see_name)
     * - seePersonal    (mail, username, structure level) (ownPage)
     * - manage         (everything) (user.can_manage)
     * - changePersonal (mail, username, about) (user.can_manage or ownPage)
     * - changePassword (user.can_change_password)
     *
     * @param action the action the user tries to perform
     */
    public isAllowed(action: string, isOwnPage: boolean): boolean {
        return this.userService.isAllowed(action, isOwnPage);
    }

    public togglePresenceByNumber(...numbers: string[]): Promise<Identifiable[]> {
        const payload = numbers.map(number => ({
            meeting_id: this.activeMeetingId,
            number
        }));
        return this.actions
            .create<Identifiable>({ action: UserAction.TOGGLE_PRESENCE_BY_NUMBER, data: payload })
            .resolve() as any;
    }

    public setPresent(isPresent: boolean, ...users: ViewUser[]): Action<void> {
        this.repo.preventAlterationOnDemoUsers(users);
        const payload: any[] = users.map(user => ({
            id: user.id,
            meeting_id: this.activeMeetingId,
            present: isPresent
        }));
        return this.actions.create({ action: UserAction.SET_PRESENT, data: payload });
    }

    public async removeUsersFromMeeting(
        users: ViewUser[],
        meeting: ViewMeeting = this.activeMeeting
    ): Promise<boolean> {
        // only delete users which are in meeting scope
        const scopes = await this.userScopePresenter.call({ user_ids: users.map(user => user.id) });
        const meetingScopeUserIds = Object.entries(scopes)
            .filter(([_, entry]) => entry.collection == meeting.COLLECTION && entry.id == meeting.id)
            .map(([key, _]) => parseInt(key));
        const relatedModels = meetingScopeUserIds
            ? await this.userRelatedModelsPresenter.call({ user_ids: meetingScopeUserIds })
            : {};
        const toDelete = meetingScopeUserIds.filter(
            id => relatedModels[id].meetings?.length === 1 && relatedModels[id].meetings[0].id === meeting.id
        );
        const toDeleteUsers = toDelete.map(id => this.getViewModel(id)!);
        const toRemove = users.map(user => user.id).difference(toDelete);
        const toRemoveUsers = toRemove.map(id => this.getViewModel(id));

        const prompt = await this.userDeleteDialog.open({
            toDelete: toDeleteUsers,
            toRemove: toRemoveUsers,
            relatedModelsResult: relatedModels
        });
        const answer = await firstValueFrom(prompt.afterClosed());
        if (answer) {
            const patch = { group_ids: [] };
            await this.delete(toDeleteUsers, true)
                .concat(this.update(patch, ...toRemoveUsers))
                .resolve();
        }
        return answer;
    }

    /**
     * Sets the state of many users. The "state" means any boolean attribute of a user like active or physical person.
     *
     * @param users The users to set the state
     * @param field The boolean field to set
     * @param value The value to set this field to.
     */
    public async setState(field: UserStateField, value: boolean, ...users: ViewUser[]): Promise<void> {
        this.repo.preventAlterationOnDemoUsers(users);
        await this.update(user => ({ id: user.id, [field]: value }), ...users).resolve();
    }

    public getViewModelByNumber(participantNumber: string): ViewUser | null {
        return this.getViewModelList().find(user => user.number() === participantNumber) || null;
    }

    public getRandomPassword(): string {
        return this.userController.getRandomPassword();
    }

    public parseStringIntoUser(name: string): FullNameInformation {
        return this.userController.parseStringIntoUser(name);
    }

    /**
     * Creates a new User from a string
     *
     * @param name: String to create the user from -> assuming its the fullname of a user (not their username)
     * @returns Promise with a created user id and the raw name used as input
     */
    public async createFromString(name: string): Promise<RawUser> {
        const newUser = this.parseStringIntoUser(name);
        // we want to generate the username in the backend
        newUser.username = ``;
        const newUserPayload: any = {
            ...newUser,
            is_active: false,
            group_ids: [this.activeMeeting?.default_group_id]
        };
        const identifiable = (await this.create(newUserPayload))[0];
        const getNameFn = () => this.userController.getShortName(newUser);
        return {
            id: identifiable.id,
            meeting_user_id: identifiable.meeting_user_id,
            ...newUser,
            fqid: `${User.COLLECTION}/${identifiable.id}`,
            getTitle: getNameFn,
            getListTitle: getNameFn
        };
    }

    protected override onMeetingIdChanged(): void {
        this._participantListSubject.next([]);
    }

    private validatePayload(participant: Partial<User & MeetingUser> | Partial<ViewUser>): any {
        return {
            ...participant,
            meeting_users: [
                {
                    group_ids: this.validateField(participant, `group_ids`),
                    structure_level_ids: this.validateField(participant, `structure_level_ids`),
                    number: this.validateField(participant, `number`),
                    vote_weight: toDecimal(this.validateField(participant, `vote_weight`), false),
                    vote_delegated_to_id: this.validateField(participant, `vote_delegated_to_id`),
                    vote_delegations_from_ids: this.validateField(participant, `vote_delegations_from_ids`),
                    about_me: this.validateField(participant, `about_me`),
                    comment: this.validateField(participant, `comment`)
                }
            ]
        };
    }

    private validateField(participant: Partial<ViewUser> | Partial<User & MeetingUser>, fieldname: string): any {
        return typeof participant[fieldname] === `function` ? participant[fieldname]() : participant[fieldname];
    }
}
