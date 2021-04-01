import { Injectable } from '@angular/core';

import { UserAction } from 'app/core/actions/user-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { PreventedInDemo } from 'app/core/definitions/custom-errors';
import { Id } from 'app/core/definitions/key-types';
import { NewEntry } from 'app/core/ui-services/base-import.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { UserSortProperty } from 'app/shared/models/event-management/meeting';
import { User } from 'app/shared/models/users/user';
import { toDecimal } from 'app/shared/utils/to-decimal';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

export interface MassImportResult {
    importedTrackIds: number[];
    errors: { [id: number]: string };
}

export interface NewUser {
    id: number;
    name: string;
}

interface CreateTemporaryPayloadWithPresent extends UserAction.CreateTemporaryPayload {
    is_present: boolean;
}

/**
 * Unified type name for state fields like `is_active`, `is_physical_person` and `is_present_in_meetings`.
 */
export type UserStateField = 'is_active' | 'is_present_in_meetings' | 'is_physical_person';

export type AuthType = 'default' | 'saml';

/**
 * type for determining the user name from a string during import.
 * See {@link parseUserString} for implementations
 */
type StringNamingSchema = 'lastCommaFirst' | 'firstSpaceLast';

export interface ShortNameInformation {
    title?: string;
    username: string;
    first_name?: string;
    last_name?: string;
}
interface LevelAndNumberInformation {
    structure_level: (meetingId?: Id) => string;
    number: (meetingId?: Id) => string;
}
type FullNameInformation = ShortNameInformation & LevelAndNumberInformation;

const SHORT_NAME_FIELDS: (keyof User | { templateField: keyof User })[] = [
    'title',
    'username',
    'first_name',
    'last_name'
];

/**
 * Repository service for users
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class UserRepositoryService
    extends BaseRepositoryWithActiveMeeting<ViewUser, User>
    implements ModelRequestRepository {
    /**
     * The property the incoming data is sorted by
     */
    protected sortProperty: UserSortProperty;

    private demoModeUserIds: number[] | null = null;

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(repositoryServiceCollector, User);
        this.sortProperty = this.meetingSettingsService.instant('users_sort_by');
        this.meetingSettingsService.get('users_sort_by').subscribe(conf => {
            this.sortProperty = conf;
            this.setConfigSortFn();
        });
        // TODO
        /*this.constantsService.get<any>('Settings').subscribe(settings => {
            if (settings) {
                this.demoModeUserIds = settings.DEMO_USERS || null;
            }
        });*/
    }

    public getFieldsets(): Fieldsets<User> {
        const listFields = SHORT_NAME_FIELDS.concat([
            'email',
            'gender',
            'is_active',
            'is_physical_person',
            'is_present_in_meeting_ids',
            'last_email_send',
            { templateField: 'number_$' },
            'default_number',
            { templateField: 'comment_$' },
            'default_structure_level',
            { templateField: 'structure_level_$' },
            'default_vote_weight',
            { templateField: 'vote_weight_$' },
            'meeting_id'
        ]);
        return {
            shortName: SHORT_NAME_FIELDS,
            list: listFields,
            [DEFAULT_FIELDSET]: listFields.concat(['about_me', 'comment', 'default_password'])
        };
    }

    public create(partialUser: Partial<UserAction.CreatePayload>): Promise<Identifiable> {
        const username = partialUser.username || partialUser.first_name + partialUser.last_name;
        const payload: UserAction.CreatePayload = {
            username,
            ...this.getPartialUserPayload(partialUser)
        };
        return this.sendActionToBackend(UserAction.CREATE, payload);
    }

    public async update(
        update: Partial<UserAction.UpdatePayload> | Partial<UserAction.UpdateTemporaryPayload>,
        user: ViewUser
    ): Promise<void> {
        if (user.isTemporary) {
            return this.updateTemporary(update as UserAction.UpdateTemporaryPayload, user);
        } else {
            return this.updateNonTemporary(update as UserAction.UpdatePayload, user);
        }
    }

    private updateNonTemporary(update: Partial<UserAction.UpdatePayload>, viewUser: ViewUser): Promise<void> {
        const payload: UserAction.UpdatePayload = {
            id: viewUser.id,
            ...this.getPartialUserPayload(update)
        };
        return this.sendActionToBackend(UserAction.UPDATE, payload);
    }

    public async delete(user: ViewUser): Promise<void> {
        if (user.isTemporary) {
            return this.deleteTemporary(user);
        } else {
            return this.deleteNonTemporary(user);
        }
    }

    private deleteNonTemporary(viewUser: ViewUser): Promise<void> {
        const payload: UserAction.DeletePayload = { id: viewUser.id };
        return this.sendActionToBackend(UserAction.DELETE, payload);
    }

    private getUsername(partialUser: Partial<UserAction.CreateTemporaryPayload>): string | null {
        if (partialUser.username) {
            return partialUser.username.trim();
        }
        const parts = [partialUser.first_name, partialUser.last_name].filter(x => !!x);
        return parts.join(' ').trim() || null;
    }

    public createTemporary(partialUser: Partial<CreateTemporaryPayloadWithPresent>): Promise<Identifiable> {
        const username = this.getUsername(partialUser);
        if (!username) {
            this.raiseError('first name or last name must not be empty.');
            return;
        }
        const payload: UserAction.CreateTemporaryPayload = {
            ...this.getPartialTemporaryUserPayload(partialUser),

            // overwrite some attribues from getPartialTemporaryUserPayload
            meeting_id: this.activeMeetingId,
            is_present_in_meeting_ids: partialUser.is_present ? [this.activeMeetingId] : [],
            username
        };
        return this.sendActionToBackend(UserAction.CREATE_TEMPORARY, payload);
    }

    private updateTemporary(update: Partial<UserAction.UpdateTemporaryPayload>, viewUser: ViewUser): Promise<void> {
        const payload: UserAction.UpdateTemporaryPayload = {
            id: viewUser.id,
            ...this.getPartialTemporaryUserPayload(update)
        };
        return this.sendActionToBackend(UserAction.UPDATE_TEMPORARY, payload);
    }

    private getPartialCommonUserPayload(
        partialUser: Partial<UserAction.CommonUserPayload>
    ): Partial<UserAction.CommonUserPayload> {
        return {
            // Optional:
            title: partialUser.title,
            first_name: partialUser.first_name,
            last_name: partialUser.last_name,
            is_active: partialUser.is_active,
            is_physical_person: partialUser.is_physical_person,
            gender: partialUser.gender,
            email: partialUser.email,
            vote_weight: toDecimal(partialUser.vote_weight as any),
            is_present_in_meeting_ids: partialUser.is_present_in_meeting_ids
        };
    }

    private getPartialTemporaryUserPayload(
        partialUser: Partial<UserAction.UpdateTemporaryPayload>
    ): Partial<UserAction.UpdateTemporaryPayload> {
        return {
            // Required:
            username: partialUser.username,
            // Optional:
            ...this.getPartialCommonUserPayload(partialUser),
            default_password: partialUser.default_password,
            vote_delegations_from_ids: partialUser.vote_delegations_from_ids,
            comment: partialUser.comment,
            about_me: partialUser.about_me,
            structure_level: partialUser.structure_level,
            number: partialUser.number,
            group_ids: partialUser.group_ids
        };
    }

    private getPartialUserPayload(partialUser: any): Partial<UserAction.UpdatePayload> {
        return {
            username: partialUser.username,
            ...this.getPartialCommonUserPayload(partialUser),
            group_$_ids: { [this.activeMeetingId]: partialUser.group_ids },
            comment_$: { [this.activeMeetingId]: partialUser.comment as string },
            number_$: { [this.activeMeetingId]: partialUser.number as string },
            structure_level_$: { [this.activeMeetingId]: partialUser.structure_level as string },
            about_me_$: { [this.activeMeetingId]: partialUser.about_me as string },
            role_id: partialUser.role_id,
            guest_meeting_ids: partialUser.guest_meeting_ids,
            committee_as_member_ids: partialUser.committee_as_member_ids,
            committee_as_manager_ids: partialUser.committee_as_manager_ids,
            vote_delegations_$_from_ids: { [this.activeMeetingId]: partialUser.vote_delegations_from_ids }
        };
    }

    private deleteTemporary(viewUser: ViewUser): Promise<void> {
        const payload: UserAction.DeleteTemporaryPayload = { id: viewUser.id };
        return this.sendActionToBackend(UserAction.DELETE_TEMPORARY, payload);
    }

    public getTitle = (viewUser: ViewUser) => {
        return this.getFullName(viewUser);
    };

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [{ idField: 'user_ids', fieldset: 'shortName' }]
        };
    }

    /**
     * Getter for the short name (Title, given name, surname)
     *
     * @returns a non-empty string
     */
    public getShortName(user: ShortNameInformation): string {
        const title = user.title ? user.title.trim() : '';
        const firstName = user.first_name ? user.first_name.trim() : '';
        const lastName = user.last_name ? user.last_name.trim() : '';

        let shortName;
        if (firstName || lastName) {
            shortName = `${firstName} ${lastName}`;
        } else {
            shortName = user.username;
        }

        if (title) {
            shortName = `${title} ${shortName}`;
        }

        return shortName.trim();
    }

    public getFullName(user: FullNameInformation): string {
        let fullName = this.getShortName(user);
        const additions: string[] = [];

        // addition: add number and structure level
        const structure_level = user.structure_level() || '';
        if (structure_level) {
            additions.push(structure_level);
        }

        const number = user.number() || '';
        if (number) {
            additions.push(`${this.translate.instant('No.')} ${number}`);
        }

        if (additions.length > 0) {
            fullName += ' (' + additions.join(' · ') + ')';
        }
        return fullName;
    }

    public getLevelAndNumber(user: LevelAndNumberInformation): string {
        if (user.structure_level() && user.number()) {
            return `${user.structure_level()} · ${this.translate.instant('No.')} ${user.number()}`;
        } else if (user.structure_level()) {
            return user.structure_level();
        } else if (user.number()) {
            return `${this.translate.instant('No.')} ${user.number()}`;
        } else {
            return '';
        }
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Participants' : 'Participant');
    };

    /**
     * Generates a random password
     *
     * @param length The length of the password to generate
     * @returns a random password
     */
    public getRandomPassword(length: number = 10): string {
        let pw = '';
        const characters = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        // set charactersLengthPower2 to characters.length rounded up to the next power of two
        let charactersLengthPower2 = 1;
        while (characters.length > charactersLengthPower2) {
            charactersLengthPower2 *= 2;
        }
        while (pw.length < length) {
            const random = new Uint8Array(length - pw.length);
            window.crypto.getRandomValues(random);
            for (let i = 0; i < random.length; i++) {
                const r = random[i] % charactersLengthPower2;
                if (r < characters.length) {
                    pw += characters.charAt(r);
                }
            }
        }
        return pw;
    }

    /**
     * Adds the short and full name to the view user.
     */
    protected createViewModel(model: User): ViewUser {
        const viewModel = super.createViewModel(model);
        viewModel.getFullName = () => this.getFullName(viewModel);
        viewModel.getShortName = () => this.getShortName(viewModel);
        viewModel.getLevelAndNumber = () => this.getLevelAndNumber(viewModel);
        viewModel.getEnsuredActiveMeetingId = () => {
            const meetingId = this.activeMeetingIdService.meetingId;
            if (!meetingId) {
                throw new Error('No active meeting selected!');
            }
            return meetingId;
        };
        return viewModel;
    }

    public async setPassword(user: ViewUser, password: string, setAsDefault: boolean = true): Promise<void> {
        if (user.isTemporary) {
            return this.setPasswordTemporary(user, password, setAsDefault);
        } else {
            return this.setPasswordNonTemporary(user, password, setAsDefault);
        }
    }

    /**
     * Updates the password and sets the password without checking for the old one.
     * Also resets the 'default password' to the newly created one.
     *
     * @param user The user to update
     * @param password The password to set
     * @param setAsDefault Control, if the default password should be updated. Defaults to `true`.
     */
    private async setPasswordNonTemporary(user: ViewUser, password: string, setAsDefault?: boolean): Promise<void> {
        const payload: UserAction.SetPasswordPayload = {
            id: user.id,
            password,
            set_as_default: setAsDefault
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD, payload);
    }

    /**
     * Updates the password and sets the password without checking for the old one.
     * Also resets the 'default password' to the newly created one.
     *
     * @param user The user to update
     * @param password The password to set
     * @param setAsDefault Control, if the default password should be updated. Defaults to `true`.
     */
    private async setPasswordTemporary(user: ViewUser, password: string, setAsDefault?: boolean): Promise<void> {
        this.preventAlterationOnDemoUsers(user);
        const payload: UserAction.SetPasswordTemporaryPayload = {
            id: user.id,
            password,
            set_as_default: setAsDefault
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD_TEMPORARY, payload);
    }

    public async resetPasswordToDefault(user: ViewUser): Promise<void> {
        if (user.isTemporary) {
            return this.resetPasswordToDefaultTemporary(user);
        } else {
            return this.resetPasswordToDefaultNonTemporary(user);
        }
    }

    private async resetPasswordToDefaultNonTemporary(user: ViewUser): Promise<void> {
        const payload: UserAction.ResetPasswordToDefaultPayload = {
            id: user.id
        };
        return this.sendActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT, payload);
    }

    private async resetPasswordToDefaultTemporary(user: ViewUser): Promise<void> {
        const payload: UserAction.ResetPasswordToDefaultTemporaryPayload = {
            id: user.id
        };
        return this.sendActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT_TEMPORARY, payload);
    }

    /**
     * Updates the password and sets a new one, if the old one was correct.
     *
     * @param oldPassword the old password
     * @param newPassword the new password
     */
    public async setPasswordSelf(user: ViewUser, oldPassword: string, newPassword: string): Promise<void> {
        this.preventAlterationOnDemoUsers(user); // What does this do?
        const payload: UserAction.SetPasswordSelfPayload = {
            old_password: oldPassword,
            new_password: newPassword
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD_SELF, payload);
    }

    public async setPresent(user: ViewUser, present: boolean): Promise<void> {
        if (user.isTemporary) {
            return this.setPresentTemporary(user, present);
        } else {
            return this.setPresentNonTemporary(user, present);
        }
    }

    private async setPresentNonTemporary(user: ViewUser, present: boolean): Promise<void> {
        this.preventAlterationOnDemoUsers(user);
        const currentMeetingIds = user.is_present_in_meeting_ids || [];
        const payload: UserAction.UpdatePayload = {
            id: user.id,
            is_present_in_meeting_ids: present
                ? [...currentMeetingIds, this.activeMeetingId]
                : user.is_present_in_meeting_ids.filter(id => id !== this.activeMeetingId)
        };
        this.sendActionToBackend(UserAction.UPDATE, payload);
    }

    private async setPresentTemporary(user: ViewUser, present: boolean): Promise<void> {
        this.preventAlterationOnDemoUsers(user);
        const payload: UserAction.UpdateTemporaryPayload = {
            id: user.id,
            is_present_in_meeting_ids: present
                ? [...user.is_present_in_meeting_ids, this.activeMeetingId]
                : user.is_present_in_meeting_ids.filter(id => id !== this.activeMeetingId)
        };
        this.sendActionToBackend(UserAction.UPDATE_TEMPORARY, payload);
    }

    /**
     * Resets the passwords of all given users to their default ones. The operator will
     * not be changed (if provided in `users`).
     *
     * @param users The users to reset the passwords from
     */
    public async bulkResetPasswordsToDefault(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.ResetPasswordToDefaultPayload[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT, payload);
    }

    /**
     * Resets the passwords of all given users to their default ones. The operator will
     * not be changed (if provided in `users`).
     *
     * @param users The users to reset the passwords from
     */
    public async bulkResetPasswordsToDefaultTemporary(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.ResetPasswordToDefaultTemporaryPayload[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT_TEMPORARY, payload);
    }

    /**
     * Generates new random passwords for many users. The default password will be set to these. The
     * operator will not be changed (if provided in `users`).
     *
     * @param users The users to generate new passwords for
     */
    public async bulkGenerateNewPasswords(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.GenerateNewPassword[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.GENERATE_NEW_PASSWORD, payload);
    }

    public async bulkGenerateNewPasswordsTemporary(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.GenerateNewPasswordTemporary[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.GENERATE_NEW_PASSWORD_TEMPORARY, payload);
    }

    /**
     * Creates and saves a list of users in a bulk operation.
     *
     * @param newEntries
     */
    public async bulkCreateTemporary(
        newEntries: NewEntry<UserAction.CreateTemporaryPayload>[]
    ): Promise<MassImportResult> {
        const data: UserAction.CreateTemporaryPayload[] = newEntries.map(entry => {
            return {
                meeting_id: this.activeMeetingIdService.meetingId,
                username: entry.newEntry.username,
                importTrackId: entry.importTrackId,
                ...this.getPartialTemporaryUserPayload(entry.newEntry)
            };
        });
        return this.sendBulkActionToBackend(UserAction.CREATE_TEMPORARY, data);
    }

    /**
     * Deletes many users. The operator will not be deleted (if included in `uisers`)
     *
     * @param users The users to delete
     */
    public async bulkDeleteTemporary(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        return this.sendBulkActionToBackend(
            UserAction.DELETE_TEMPORARY,
            users.map(user => ({ id: user.id }))
        );
    }

    /**
     * Sets the state of many users. The "state" means any boolean attribute of a user like active or physical person.
     *
     * @param users The users to set the state
     * @param field The boolean field to set
     * @param value The value to set this field to.
     */
    public async bulkSetStateTemporary(users: ViewUser[], field: UserStateField, value: boolean): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdateTemporaryPayload[] = users.map(user => ({ id: user.id, [field]: value }));
        return this.sendBulkActionToBackend(UserAction.UPDATE_TEMPORARY, payload);
    }

    public bulkAddGroupsToUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdatePayload[] = users.map(user => {
            groupIds = groupIds.concat(user.group_ids());
            return {
                id: user.id,
                group_ids: groupIds.filter((groupId, index, self) => self.indexOf(groupId) === index)
            };
        });
        return this.sendBulkActionToBackend(UserAction.UPDATE, payload);
    }

    public bulkRemoveGroupsFromUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdatePayload[] = users.map(user => ({
            id: user.id,
            group_ids: user.group_ids().filter(groupId => !groupIds.includes(groupId))
        }));
        return this.sendBulkActionToBackend(UserAction.UPDATE, payload);
    }

    public bulkAddGroupsToTemporaryUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdateTemporaryPayload[] = users.map(user => {
            groupIds = groupIds.concat(user.group_ids());
            return {
                id: user.id,
                group_ids: groupIds.filter((groupId, index, self) => self.indexOf(groupId) === index)
            };
        });
        return this.sendBulkActionToBackend(UserAction.UPDATE_TEMPORARY, payload);
    }

    public bulkRemoveGroupsFromTemporaryUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdateTemporaryPayload[] = users.map(user => ({
            id: user.id,
            group_ids: user.group_ids().filter(groupId => !groupIds.includes(groupId))
        }));
        return this.sendBulkActionToBackend(UserAction.UPDATE_TEMPORARY, payload);
    }

    /**
     * Sends invitation emails to all given users. Returns a prepared string to show the user.
     * This string should always be shown, becuase even in success cases, some users may not get
     * an email and the user should be notified about this.
     *
     * @param users All affected users
     */
    public async bulkSendInvitationEmail(users: ViewUser[]): Promise<string> {
        this.preventInDemo();
        const user_ids = users.map(user => user.id);
        const users_email_subject = this.meetingSettingsService.instant('users_email_subject');
        const users_email_body = this.meetingSettingsService.instant('users_email_body');
        const subject = this.translate.instant(users_email_subject);
        const message = this.translate.instant(users_email_body);

        throw new Error('TODO');
        /* const response = await this.httpService.post<{ count: number; no_email_ids: number[] }>(
            '/rest/users/user/mass_invite_email/',
            {
                user_ids: user_ids,
                subject: subject,
                message: message
            }
        );

        const numEmails = response.count;
        const noEmailIds = response.no_email_ids;
        let msg;
        if (numEmails === 0) {
            msg = this.translate.instant('No emails were send.');
        } else if (numEmails === 1) {
            msg = this.translate.instant('One email was send sucessfully.');
        } else {
            msg = this.translate.instant('%num% emails were send sucessfully.');
            msg = msg.replace('%num%', numEmails);
        }

        if (noEmailIds.length) {
            msg += ' ';

            if (noEmailIds.length === 1) {
                msg += this.translate.instant(
                    'The user %user% has no email, so the invitation email could not be send.'
                );
            } else {
                msg += this.translate.instant(
                    'The users %user% have no email, so the invitation emails could not be send.'
                );
            }

            // This one builds a username string like "user1, user2 and user3" with the full names.
            const usernames = noEmailIds
                .map(id => this.getViewModel(id))
                .filter(user => !!user)
                .map(user => user.short_name);
            let userString;
            if (usernames.length > 1) {
                const lastUsername = usernames.pop();
                userString = usernames.join(', ') + ' ' + this.translate.instant('and') + ' ' + lastUsername;
            } else {
                userString = usernames.join(', ');
            }
            msg = msg.replace('%user%', userString);
        }

        return msg; */
    }

    /**
     * Searches and returns Users by full name
     *
     * @param name
     * @returns all users matching that name (unsorted)
     */
    public getUsersByName(name: string): ViewUser[] {
        return this.getViewModelList().filter(user => {
            return user.full_name === name || user.short_name === name || user.number() === name;
        });
    }

    /**
     * Searches and returns Users by participant number
     *
     * @param number: A participant number
     * @returns all users matching that number
     */
    public getUsersByNumber(number: string): ViewUser[] {
        return this.getViewModelList().filter(user => user.number() === number);
    }

    /**
     * Creates a new User from a string
     *
     * @param user: String to create the user from
     * @returns Promise with a created user id and the raw name used as input
     */
    public async createFromString(user: string): Promise<NewUser> {
        const newUser = this.parseUserString(user) as any;
        const createdUser = await this.createTemporary(newUser);
        return { id: createdUser.id, name: user } as NewUser;
    }

    /**
     * Tries to convert a user string into an user. Names that don't fit the scheme given
     * will be entered into the first_name field
     *
     * Naming schemes are:
     * - firstSpaceLast: One or two space-separated words are assumed, matching
     * given name and surname
     * - lastCommaFirst: A comma is supposed to separate last name(s) from given name(s).
     * TODO: More advanced logic(s) to fit names
     *
     * @param inputUser A raw user string
     * @param schema optional hint on how to handle the strings.
     * @returns A User object (note: is only a local object, not uploaded to the server)
     */
    public parseUserString(inputUser: string, schema: StringNamingSchema = 'firstSpaceLast'): User {
        const newUser: Partial<User> = {};
        if (schema === 'lastCommaFirst') {
            const commaSeparated = inputUser.split(',');
            switch (commaSeparated.length) {
                case 1:
                    newUser.first_name = commaSeparated[0];
                    break;
                case 2:
                    newUser.last_name = commaSeparated[0];
                    newUser.first_name = commaSeparated[1];
                    break;
                default:
                    newUser.first_name = inputUser;
            }
        } else if (schema === 'firstSpaceLast') {
            const splitUser = inputUser.split(' ');
            switch (splitUser.length) {
                case 1:
                    newUser.first_name = splitUser[0];
                    break;
                case 2:
                    newUser.first_name = splitUser[0];
                    newUser.last_name = splitUser[1];
                    break;
                default:
                    newUser.first_name = inputUser;
            }
        }
        return new User(newUser);
    }

    /**
     * Returns all duplicates of an user (currently: full name matches)
     *
     * @param user
     */
    public getUserDuplicates(user: ViewUser): ViewUser[] {
        return this.getViewModelList().filter(existingUser => existingUser.full_name === user.full_name);
    }

    /**
     * Triggers an update for the sort function responsible for the default sorting of data items
     */
    public setConfigSortFn(): void {
        this.setSortFunction((a: ViewUser, b: ViewUser) => {
            if (a[this.sortProperty] && b[this.sortProperty]) {
                if (typeof a[this.sortProperty] === 'function') {
                    const fnA = a[this.sortProperty] as () => string;
                    const fnB = b[this.sortProperty] as () => string;
                    return this.languageCollator.compare(fnA(), fnB());
                }
                if (a[this.sortProperty] === b[this.sortProperty]) {
                    return this.languageCollator.compare(a.short_name, b.short_name);
                } else {
                    return this.languageCollator.compare(
                        a[this.sortProperty] as string,
                        b[this.sortProperty] as string
                    );
                }
            } else if (a[this.sortProperty] && !b[this.sortProperty]) {
                return -1;
            } else if (b[this.sortProperty]) {
                return 1;
            } else {
                return this.languageCollator.compare(a.short_name, b.short_name);
            }
        });
    }

    /**
     * Get the date of the last invitation email.
     *
     * @param user
     * @returns a localized string representation of the date/time the last email was sent;
     * or an empty string
     */
    public lastSentEmailTimeString(user: ViewUser): string {
        if (!user.user || !user.user.last_email_send) {
            return '';
        }
        return new Date(user.user.last_email_send).toLocaleString(this.translate.currentLang);
    }

    private preventAlterationOnDemoUsers(users: ViewUser | ViewUser[]): void {
        if (Array.isArray(users)) {
            if (this.demoModeUserIds && users.map(user => user.id).intersect(this.demoModeUserIds).length > 0) {
                this.preventInDemo();
            }
        } else if (this.demoModeUserIds?.some(userId => userId === users.id)) {
            this.preventInDemo();
        }
    }

    private preventInDemo(): void {
        if (this.demoModeUserIds && this.demoModeUserIds.length) {
            throw new PreventedInDemo();
        }
    }
}
