import { Injectable } from '@angular/core';

import { UserAction } from 'app/core/actions/user-action';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { PreventedInDemo } from 'app/core/definitions/custom-errors';
import { Id } from 'app/core/definitions/key-types';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { UserSortProperty } from 'app/shared/models/event-management/meeting';
import { User } from 'app/shared/models/users/user';
import { toDecimal } from 'app/shared/utils/to-decimal';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { Displayable } from '../../../site/base/displayable';
import { PresenterService } from '../../core-services/presenter.service';
import { Meeting } from '../../../shared/models/event-management/meeting';

export interface MassImportResult {
    importedTrackIds: number[];
    errors: { [id: number]: string };
}

export type RawUser = FullNameInformation & Identifiable & Displayable;

/**
 * Unified type name for state fields like `is_active`, `is_physical_person` and `is_present_in_meetings`.
 */
export type UserStateField = 'is_active' | 'is_present_in_meetings' | 'is_physical_person';

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

interface EmailSentResult {
    sent: boolean;
    recipient_user_id: Id;
    recipient_meeting_id: Id;
    recipient: string; // email-address
}

interface LevelAndNumberInformation {
    structure_level: (meetingId?: Id) => string;
    number: (meetingId?: Id) => string;
}
type FullNameInformation = ShortNameInformation & LevelAndNumberInformation;

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
    implements ModelRequestRepository
{
    /**
     * The property the incoming data is sorted by
     */
    protected sortProperty: UserSortProperty;

    private demoModeUserIds: number[] | null = null;

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private activeMeeting: ActiveMeetingService
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
        const shortNameFields: (keyof User | { templateField: keyof User })[] = [
            'title',
            'first_name',
            'last_name',
            'username' /* Required! To getShortName */
        ];
        const singleVotesFields = shortNameFields.concat([
            { templateField: 'vote_weight_$' },
            { templateField: 'structure_level_$' },
            { templateField: 'number_$' }
        ]);
        /**
         * TODO: Some of thouse are not needed in the lists
         */
        const listFields = shortNameFields.concat(singleVotesFields, [
            'email',
            'gender',
            'is_active',
            'is_physical_person',
            'is_present_in_meeting_ids',
            'last_email_send',
            'default_number',
            'default_structure_level',
            'default_vote_weight',
            { templateField: 'comment_$' }
        ]);
        const committeeEditFields = shortNameFields.concat([
            'committee_ids',
            { templateField: 'committee_$_management_level' }
        ]);
        const committeeListFields = [{ templateField: 'committee_$_management_level' }];
        const detailFields = listFields.concat([
            'username',
            { templateField: 'about_me_$' },
            'comment',
            'default_password'
        ]);
        const orgaListFields = listFields.concat(['committee_ids', 'organization_management_level']);
        const orgaEditFields = orgaListFields.concat([
            'default_password',
            { templateField: 'committee_$_management_level' }
        ]);
        const voteProgressFields: (keyof User | { templateField: keyof User })[] = [
            'is_present_in_meeting_ids',
            'group_$_ids'
        ];

        return {
            [DEFAULT_FIELDSET]: detailFields,
            shortName: shortNameFields,
            list: listFields,
            orgaList: orgaListFields,
            orgaEdit: orgaEditFields,
            singleVotes: singleVotesFields,
            committeeEdit: committeeEditFields,
            committeeList: committeeListFields,
            voteProgress: voteProgressFields
        };
    }

    public create(...usersToCreate: Partial<UserAction.CreatePayload>[]): Promise<Identifiable[]> {
        const payload: UserAction.CreatePayload[] = usersToCreate.map(partialUser => ({
            ...this.sanitizePayload(this.getBaseUserPayload(partialUser)),
            is_present_in_meeting_ids: partialUser.is_present_in_meeting_ids || []
        }));
        return this.sendBulkActionToBackend(UserAction.CREATE, payload);
    }

    /**
     * A function to update multiple users at once. To update these users, an object can be passed as payload
     * or a function can be passed to generate a payload depending on a specific user.
     *
     * @param patch An update-payload object or a function to generate a payload. The function gets a user as argument.
     * @param users A list of users, who will be updated.
     */
    public update(
        patch: Partial<UserAction.UpdatePayload> | ((user: ViewUser) => Partial<UserAction.UpdatePayload>),
        ...users: ViewUser[]
    ): Promise<void> {
        const updatePayload = users.map(user => {
            const update = typeof patch === 'function' ? patch(user) : patch;
            return {
                id: user.id,
                ...this.sanitizePayload(this.getBaseUserPayload(update))
            };
        });
        return this.sendBulkActionToBackend(UserAction.UPDATE, updatePayload);
    }

    public updateSelf(patch: any | ((user: ViewUser) => any), user: ViewUser): Promise<void> {
        const update = typeof patch === 'function' ? patch(user) : patch;
        const payload: UserAction.UpdateSelfPayload = {
            email: update.email,
            about_me_$: {
                [this.activeMeetingId]: update.about_me
            },
            username: update.username
        };
        return this.sendActionToBackend(UserAction.UPDATE_SELF, payload);
    }

    private getBaseUserPayload(partialUser: any): Partial<UserAction.BaseUserPayload> {
        let partialPayload: Partial<UserAction.BaseUserPayload> = {
            title: partialUser.title,
            first_name: partialUser.first_name,
            last_name: partialUser.last_name,
            username: partialUser.username,
            is_active: partialUser.is_active,
            is_physical_person: partialUser.is_physical_person,
            default_password: partialUser.default_password,
            gender: partialUser.gender,
            email: partialUser.email,
            default_structure_level: partialUser.default_structure_level,
            default_number: partialUser.default_number,
            default_vote_weight: toDecimal(partialUser.default_vote_weight),
            committee_ids: partialUser.committee_ids,
            committee_$_management_level: partialUser.committee_$_management_level,
            organization_management_level: partialUser.organization_management_level
        };

        if (this.activeMeetingId) {
            const defaultGroupId = this.activeMeeting.meeting.default_group_id;
            partialPayload = {
                ...partialPayload,
                number_$: { [this.activeMeetingId]: partialUser.number as string },
                structure_level_$: { [this.activeMeetingId]: partialUser.structure_level as string },
                vote_weight_$: { [this.activeMeetingId]: toDecimal(partialUser.vote_weight) },
                about_me_$: { [this.activeMeetingId]: partialUser.about_me as string },
                comment_$: { [this.activeMeetingId]: partialUser.comment as string },
                vote_delegated_$_to_id: { [this.activeMeetingId]: partialUser.vote_delegated_to_id },
                vote_delegations_$_from_ids: { [this.activeMeetingId]: partialUser.vote_delegations_from_ids },
                group_$_ids: {
                    [this.activeMeetingId]: partialUser.group_ids ? partialUser.group_ids : [defaultGroupId]
                }
            };
        }
        return partialPayload;
    }

    public getTitle = (viewUser: ViewUser) => this.getFullName(viewUser);

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

        let shortName = '';
        if (firstName || lastName) {
            shortName = `${firstName} ${lastName}`;
        } else {
            shortName = user.username;
        }

        if (title) {
            shortName = `${title} ${shortName}`;
        }

        return shortName?.trim(); // Prevent errors if username is not already loaded
    }

    public getFullName(user: FullNameInformation): string {
        let fullName = this.getShortName(user);
        const additions: string[] = [];

        // addition: add number and structure level
        const structure_level = user.structure_level ? user.structure_level() : null;
        if (structure_level) {
            additions.push(structure_level);
        }

        const number = user.number ? user.number() : null;
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

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? 'Participants' : 'Participant');

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
                // throw new Error('No active meeting selected!'); // TODO: What is with "real" users?
            }
            return meetingId;
        };
        return viewModel;
    }

    /**
     * Updates the password and sets the password without checking for the old one.
     * Also resets the 'default password' to the newly created one.
     *
     * @param user The user to update
     * @param password The password to set
     * @param setAsDefault Control, if the default password should be updated. Defaults to `true`.
     */
    public setPassword(user: ViewUser, password: string, setAsDefault?: boolean): Promise<void> {
        const payload: UserAction.SetPasswordPayload = {
            id: user.id,
            password,
            set_as_default: setAsDefault
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD, payload);
    }

    /**
     * Updates the password and sets a new one, if the old one was correct.
     *
     * @param oldPassword the old password
     * @param newPassword the new password
     */
    public setPasswordSelf(user: ViewUser, oldPassword: string, newPassword: string): Promise<void> {
        this.preventAlterationOnDemoUsers(user); // What does this do?
        const payload: UserAction.SetPasswordSelfPayload = {
            old_password: oldPassword,
            new_password: newPassword
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD_SELF, payload);
    }

    public setPresent(isPresent: boolean, ...users: ViewUser[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.SetPresentPayload[] = users.map(user => ({
            id: user.id,
            meeting_id: this.activeMeetingId,
            present: isPresent
        }));
        return this.sendBulkActionToBackend(UserAction.SET_PRESENT, payload);
    }

    /**
     * Resets the passwords of all given users to their default ones. The operator will
     * not be changed (if provided in `users`).
     *
     * @param users The users to reset the passwords from
     */
    public resetPasswordToDefault(...users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.ResetPasswordToDefaultPayload[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT, payload);
    }

    /**
     * Generates new random passwords for many users. The default password will be set to these. The
     * operator will not be changed (if provided in `users`).
     *
     * @param users The users to generate new passwords for
     */
    public bulkGenerateNewPasswords(users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.GenerateNewPasswordPayload[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.GENERATE_NEW_PASSWORD, payload);
    }

    public delete(...users: ViewUser[]): Promise<void> {
        this.preventInDemo();
        const payload: UserAction.DeletePayload[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.DELETE, payload);
    }

    public remove(meeting: Meeting, ...users: ViewUser[]): Promise<void> {
        return this.bulkRemoveGroupsFromUsers(users, meeting.group_ids);
    }

    /**
     * Sets the state of many users. The "state" means any boolean attribute of a user like active or physical person.
     *
     * @param users The users to set the state
     * @param field The boolean field to set
     * @param value The value to set this field to.
     */
    public setState(field: UserStateField, value: boolean, ...users: ViewUser[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const payload: UserAction.UpdatePayload[] = users.map(user => ({ id: user.id, [field]: value }));
        return this.sendBulkActionToBackend(UserAction.UPDATE, payload);
    }

    public bulkAddGroupsToUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => {
            groupIds = groupIds.concat(user.group_ids());
            return {
                id: user.id,
                group_ids: groupIds.filter((groupId, index, self) => self.indexOf(groupId) === index)
            };
        };
        return this.update(patchFn, ...users);
    }

    public bulkRemoveGroupsFromUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => ({
            id: user.id,
            group_ids: user.group_ids().filter(groupId => !groupIds.includes(groupId))
        });
        return this.update(patchFn, ...users);
    }

    public bulkAssignUsersToCommitteesAsMembers(users: ViewUser[], committeeIds: Id[]): Promise<void> {
        const patchFn = (user: ViewUser) => {
            committeeIds = committeeIds.concat(user.committee_ids || []);
            return {
                id: user.id,
                committee_ids: committeeIds.filter((committeeId, index, self) => self.indexOf(committeeId) === index)
            };
        };
        return this.update(patchFn, ...users);
    }

    public bulkUnassignUsersFromCommitteesAsMembers(users: ViewUser[], committeeIds: Id[]): Promise<void> {
        const patchFn = (user: ViewUser) => ({
            id: user.id,
            committee_ids: (user.committee_ids || []).filter(committeeId => !committeeIds.includes(committeeId))
        });
        return this.update(patchFn, ...users);
    }

    /**
     * Sends invitation emails to all given users. Returns a prepared string to show the user.
     * This string should always be shown, becuase even in success cases, some users may not get
     * an email and the user should be notified about this.
     *
     * @param users All affected users
     */
    public async sendInvitationEmails(users: ViewUser[], meetingIds: Id[] = [this.activeMeetingId]): Promise<string> {
        this.preventInDemo();

        const payload: UserAction.SendInvitationEmailPayload[] = users.flatMap(user =>
            meetingIds.map(meeting_id => ({ id: user.id, meeting_id }))
        );
        const response = await this.actions.sendBulkRequest<EmailSentResult>(UserAction.SEND_INVITATION_EMAIL, payload);

        const numEmails = response.filter(email => email.sent).length;
        const noEmails = response.filter(email => !email.sent);
        let responseMessage: string;
        if (numEmails === 0) {
            responseMessage = this.translate.instant('No emails were send.');
        } else if (numEmails === 1) {
            responseMessage = this.translate.instant('One email was send sucessfully.');
        } else {
            responseMessage = this.translate.instant('%num% emails were send sucessfully.');
            responseMessage = responseMessage.replace('%num%', numEmails.toString());
        }

        if (noEmails.length) {
            responseMessage += ' ';

            if (noEmails.length === 1) {
                responseMessage += this.translate.instant(
                    'The user %user% has no email, so the invitation email could not be send.'
                );
            } else {
                responseMessage += this.translate.instant(
                    'The users %user% have no email, so the invitation emails could not be send.'
                );
            }

            // This one builds a username string like "user1, user2 and user3" with the full names.
            const usernames = noEmails
                .map(email => this.getViewModel(email.recipient_user_id))
                .filter(user => !!user)
                .map(user => user.short_name);
            let userString: string;
            if (usernames.length > 1) {
                const lastUsername = usernames.pop();
                userString = usernames.join(', ') + ' ' + this.translate.instant('and') + ' ' + lastUsername;
            } else {
                userString = usernames.join(', ');
            }
            responseMessage = responseMessage.replace('%user%', userString);
        }

        return responseMessage;
    }

    /**
     * Searches and returns Users by full name
     *
     * @param name
     * @returns all users matching that name (unsorted)
     */
    public getUsersByName(name: string): ViewUser[] {
        return this.getViewModelList().filter(
            user => user.full_name === name || user.short_name === name || user.number() === name
        );
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
     * @param name: String to create the user from -> assuming its the fullname of a user (not their username)
     * @returns Promise with a created user id and the raw name used as input
     */
    public async createFromString(name: string): Promise<RawUser> {
        const newUser = this.parseStringIntoUser(name);
        const identifiable = (await this.create(newUser))[0];
        const getNameFn = () => this.getShortName(newUser);
        return { id: identifiable.id, ...newUser, getTitle: getNameFn, getListTitle: getNameFn };
    }

    public togglePresenceByNumber(...numbers: string[]): Promise<Identifiable[]> {
        const payload: UserAction.TogglePresenceByNumberPayload[] = numbers.map(number => ({
            meeting_id: this.activeMeetingId,
            number
        }));
        return this.sendBulkActionToBackend(UserAction.TOGGLE_PRESENCE_BY_NUMBER, payload);
    }

    /**
     * Tries to convert a given string into an user (representated by a `FullNameInformation`-object).
     * Names that don't fit the scheme given will be entered into the first_name field.
     *
     * Naming schemes are:
     * - firstSpaceLast: One or two space-separated words are assumed, matching
     * given name and surname
     * - lastCommaFirst: A comma is supposed to separate last name(s) from given name(s).
     * TODO: More advanced logic(s) to fit names
     *
     * @param inputUser A raw user string
     * @param schema optional hint on how to handle the strings.
     * @returns A `FullNameInformation`-object.
     */
    public parseStringIntoUser(inputUser: string, schema: StringNamingSchema = 'firstSpaceLast'): FullNameInformation {
        const newUser: FullNameInformation = {
            username: '',
            structure_level: () => '',
            number: () => ''
        };
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
        return newUser;
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
        return new Date(user.user.last_email_send * 1000).toLocaleString(this.translate.currentLang);
    }

    private sanitizePayload(payload: any): any {
        const temp = { ...payload };
        for (const key of Object.keys(temp).filter(field => !this.isFieldAllowedToBeEmpty(field))) {
            if (typeof temp[key] === 'string' && !temp[key].trim().length) {
                payload[key] = undefined;
            } else if (Array.isArray(temp[key])) {
                continue;
            } else if (typeof temp[key] === 'object' && !!temp[key]) {
                this.sanitizePayload(payload[key]);
                if (!Object.keys(payload[key]).length) {
                    delete payload[key];
                }
            }
        }
        return { ...payload };
    }

    private isFieldAllowedToBeEmpty(field: string): boolean {
        const fields: string[] = [
            'title',
            'email',
            'first_name',
            'last_name',
            'comment_$',
            'about_me_$',
            'number_$',
            'structure_level_$',
            'default_number',
            'default_structure_level'
        ];
        return fields.includes(field);
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
