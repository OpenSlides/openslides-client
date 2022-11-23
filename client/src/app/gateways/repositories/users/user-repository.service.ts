import { Injectable } from '@angular/core';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { UserAction } from 'src/app/gateways/repositories/users/user-action';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';

import { Id } from '../../../domain/definitions/key-types';
import { Displayable } from '../../../domain/interfaces/displayable';
import { Identifiable } from '../../../domain/interfaces/identifiable';
import { User, UserSortProperty } from '../../../domain/models/users/user';
import { PreventedInDemoError } from '../../../infrastructure/errors';
import { toDecimal } from '../../../infrastructure/utils';
import { ViewUser } from '../../../site/pages/meetings/view-models/view-user';
import { DEFAULT_FIELDSET, Fieldsets, TypedFieldset } from '../../../site/services/model-request-builder';
import { Action } from '../../actions';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';

export type RawUser = FullNameInformation & Identifiable & Displayable & { fqid: Fqid };

/**
 * Unified type name for state fields like `is_active`, `is_physical_person` and `is_present_in_meetings`.
 */
export type UserStateField = 'is_active' | 'is_present_in_meetings' | 'is_physical_person';

export interface AssignMeetingsPayload {
    meeting_ids: Id[];
    group_name: string;
}

export interface NameInformation {
    username: string;
    first_name?: string;
    last_name?: string;
}
export interface ShortNameInformation extends NameInformation {
    pronoun?: string;
    title?: string;
}

export type UserPatchFn = { [key in keyof User]?: any } | ((user: ViewUser) => { [key in keyof User]?: any });

export interface EmailSentResult {
    sent: boolean;
    recipient_user_id: Id;
    recipient_meeting_id: Id;
    recipient: string; // email-address
}

export interface AssignMeetingsResult {
    succeeded: Id[];
    standard_group: Id[];
    nothing: Id[];
}

interface LevelAndNumberInformation {
    structure_level: (meetingId?: Id) => string;
    number: (meetingId?: Id) => string;
}

export type FullNameInformation = ShortNameInformation & LevelAndNumberInformation;

@Injectable({
    providedIn: `root`
})
export class UserRepositoryService extends BaseRepository<ViewUser, User> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(repositoryServiceCollector, User);
    }

    /**
     * The property the incoming data is sorted by
     */
    protected sortProperty: UserSortProperty = `first_name`;

    private _demoModeUserIds: number[] | null = null;

    public override getFieldsets(): Fieldsets<User> {
        const shortNameFields: TypedFieldset<User> = [
            `title`,
            `first_name`,
            `last_name`,
            `pronoun`,
            `username` /* Required! To getShortName */,
            `is_active`,
            `is_physical_person`,
            `default_password`,
            `can_change_own_password`,
            `gender`,
            `default_number`,
            `default_structure_level`,
            `default_vote_weight`,
            `email`,
            `last_email_send`,
            `organization_management_level`,
            `meeting_ids`
        ];
        const accountListFields: TypedFieldset<User> = shortNameFields.concat([
            `committee_ids`,
            { templateField: `committee_$_management_level` }
        ]);

        const participantListFieldsMinimal: TypedFieldset<User> = [
            `title`,
            `first_name`,
            `last_name`,
            `pronoun`,
            `username` /* Required! To getShortName */,
            `gender`,
            `meeting_ids`,
            { templateField: `structure_level_$` },
            { templateField: `number_$` },
            { templateField: `group_$_ids` }
        ];

        const participantListFields: TypedFieldset<User> = shortNameFields.concat([
            { templateField: `vote_delegated_$_to_id` },
            { templateField: `vote_delegations_$_from_ids` },
            { templateField: `vote_weight_$` },
            { templateField: `structure_level_$` },
            { templateField: `number_$` },
            { templateField: `comment_$` },
            { templateField: `group_$_ids` },
            `is_present_in_meeting_ids`
        ]);

        const detailFields: TypedFieldset<User> = [{ templateField: `about_me_$` }];

        return {
            [DEFAULT_FIELDSET]: detailFields,
            accountList: accountListFields,
            participantList: participantListFields,
            participantListMinimal: participantListFieldsMinimal,
            all: detailFields.concat(accountListFields, participantListFields)
        };
    }

    public create(...usersToCreate: any[]): Promise<Identifiable[]> {
        const payload: any[] = usersToCreate.map(partialUser => ({
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
    public update(patch: UserPatchFn, ...users: ViewUser[]): Action<void> {
        const updatePayload = users.map(user => {
            const update = typeof patch === `function` ? patch(user) : patch;
            return {
                id: user.id,
                ...this.sanitizePayload(this.getBaseUserPayload(update))
            };
        });
        return this.createAction(UserAction.UPDATE, updatePayload);
    }

    public updateSelf(patch: UserPatchFn, user: ViewUser): Promise<void> {
        const update = typeof patch === `function` ? patch(user) : patch;
        const payload: any = {
            email: update.email,
            about_me_$: {},
            username: update.username,
            pronoun: update.pronoun,
            gender: update.gender
        };
        return this.sendActionToBackend(UserAction.UPDATE_SELF, payload);
    }

    public delete(users: Identifiable[], handle_separately = false): Action<void> {
        this.preventInDemo();
        const data: any[] = users.map(user => ({ id: user.id }));
        return this.actions.createFromArray([{ action: UserAction.DELETE, data }], handle_separately);
    }

    public assignMeetings(user: Identifiable, data: AssignMeetingsPayload): Action<AssignMeetingsResult> {
        const payload = [
            {
                id: user.id,
                meeting_ids: data.meeting_ids,
                group_name: data.group_name
            }
        ];
        return this.createAction(UserAction.ASSIGN_MEETINGS, payload);
    }

    private getBaseUserPayload(partialUser: Partial<User>): any {
        const partialPayload: Partial<User> = {
            pronoun: partialUser.pronoun,
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
            default_vote_weight: toDecimal(partialUser.default_vote_weight, false) as any,
            organization_management_level: partialUser.organization_management_level,
            committee_$_management_level: partialUser.committee_$_management_level,
            group_$_ids: partialUser.group_$_ids,
            structure_level_$: partialUser.structure_level_$,
            number_$: partialUser.number_$,
            about_me_$: partialUser.about_me_$,
            vote_weight_$: partialUser.vote_weight_$,
            comment_$: partialUser.comment_$,
            vote_delegated_$_to_id: partialUser.vote_delegated_$_to_id,
            vote_delegations_$_from_ids: partialUser.vote_delegations_$_from_ids
        };

        return partialPayload;
    }

    public getTitle = (viewUser: ViewUser) => this.getFullName(viewUser);

    /**
     * getter for the name
     */
    private getName(user: NameInformation): string {
        const firstName = user.first_name?.trim() || ``;
        const lastName = user.last_name?.trim() || ``;
        const userName = user.username?.trim() || ``;
        const name = firstName || lastName ? `${firstName} ${lastName}` : userName;
        return name?.trim() || ``;
    }

    /**
     * Getter for the short name (Title, given name, surname)
     *
     * @returns a non-empty string
     */
    public getShortName(user: ShortNameInformation): string {
        const title = user.title?.trim() || ``;
        const name = this.getName(user);
        return `${title} ${name}`.trim();
    }

    private getFullName(user: FullNameInformation): string {
        let fullName = this.getShortName(user);
        const additions: string[] = [];

        // addition: add pronoun, structure level and number
        if (user.pronoun) {
            additions.push(user.pronoun);
        }

        const structure_level = user.structure_level ? user.structure_level() : null;
        if (structure_level) {
            additions.push(structure_level);
        }

        const number = user.number ? user.number() : null;
        if (number) {
            additions.push(`${this.translate.instant(`No.`)} ${number}`);
        }

        if (additions.length > 0) {
            fullName += ` (` + additions.join(` · `) + `)`;
        }
        return fullName;
    }

    private getLevelAndNumber(user: LevelAndNumberInformation): string {
        if (user.structure_level() && user.number()) {
            return `${user.structure_level()} · ${this.translate.instant(`No.`)} ${user.number()}`;
        } else if (user.structure_level()) {
            return user.structure_level();
        } else if (user.number()) {
            return `${this.translate.instant(`No.`)} ${user.number()}`;
        } else {
            return ``;
        }
    }

    public getVerboseName = (plural: boolean = false): string =>
        this.translate.instant(plural ? `Participants` : `Participant`);

    /**
     * Adds the short and full name to the view user.
     */
    protected override createViewModel(model: User): ViewUser {
        const viewModel = super.createViewModel(model);
        viewModel.getName = () => this.getName(viewModel);
        viewModel.getShortName = () => this.getShortName(viewModel);
        viewModel.getFullName = () => this.getFullName(viewModel);
        viewModel.getLevelAndNumber = () => this.getLevelAndNumber(viewModel);
        viewModel.getEnsuredActiveMeetingId = () => this.activeMeetingIdService.meetingId;
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
    public setPassword(user: Identifiable, password: string, setAsDefault?: boolean): Promise<void> {
        const payload: any = {
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
    public setPasswordSelf(user: Identifiable, oldPassword: string, newPassword: string): Promise<void> {
        this.preventAlterationOnDemoUsers(user); // What does this do?
        const payload = {
            old_password: oldPassword,
            new_password: newPassword
        };
        return this.sendActionToBackend(UserAction.SET_PASSWORD_SELF, payload);
    }

    /**
     * Resets the passwords of all given users to their default ones. The operator will
     * not be changed (if provided in `users`).
     *
     * @param users The users to reset the passwords from
     */
    public resetPasswordToDefault(users: Identifiable[]): Promise<void> {
        this.preventInDemo();
        const payload: any[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.RESET_PASSWORD_TO_DEFAULT, payload);
    }

    /**
     * Generates new random passwords for many users. The default password will be set to these. The
     * operator will not be changed (if provided in `users`).
     *
     * @param users The users to generate new passwords for
     */
    public bulkGenerateNewPasswords(users: Identifiable[]): Promise<void> {
        this.preventInDemo();
        const payload: any[] = users.map(user => ({ id: user.id }));
        return this.sendBulkActionToBackend(UserAction.GENERATE_NEW_PASSWORD, payload);
    }

    public bulkRemoveUserFromMeeting(users: ViewUser[], meetingIdentifiable: Identifiable): Action<void> {
        const userPatch = users.map(user => {
            return {
                id: user.id,
                group_$_ids: {
                    [meetingIdentifiable.id]: []
                }
            };
        });
        return this.actions.create({ action: UserAction.UPDATE, data: userPatch });
    }

    /**
     * Sends invitation emails to all given users. Returns a prepared string to show the user.
     * This string should always be shown, becuase even in success cases, some users may not get
     * an email and the user should be notified about this.
     *
     * @param users All affected users
     */
    public sendInvitationEmails(users: Identifiable[], meetingId: Id): Action<EmailSentResult> {
        this.preventInDemo();
        const payload: any[] = users.flatMap(user => ({ id: user.id, meeting_id: meetingId }));
        return this.createAction<EmailSentResult>(UserAction.SEND_INVITATION_EMAIL, payload);
    }

    /**
     * Triggers an update for the sort function responsible for the default sorting of data items
     */
    public setConfigSortFn(): void {
        this.setSortFunction((a: ViewUser, b: ViewUser) => {
            if (a[this.sortProperty] && b[this.sortProperty]) {
                if (typeof a[this.sortProperty] === `function`) {
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

    public forgetPassword(...emails: string[]): Promise<void> {
        const payload: any[] = emails.map(email => ({ email }));
        return this.sendBulkActionToBackend(UserAction.FORGET_PASSWORD, payload);
    }

    public forgetPasswordConfirm(payload: {
        user_id: Id;
        authorization_token: string;
        new_password: string;
    }): Promise<void> {
        return this.sendActionToBackend(UserAction.FORGET_PASSWORD_CONFIRM, payload);
    }

    public setPresent(context: { isPresent: boolean; meetingId: Id; users: Identifiable[] }): Action<void> {
        const payload = context.users.map(user => ({
            present: context.isPresent,
            meeting_id: context.meetingId,
            id: user.id
        }));
        return this.createAction(UserAction.SET_PRESENT, payload);
    }

    private sanitizePayload(payload: any): any {
        const temp = { ...payload };
        for (const key of Object.keys(temp).filter(field => !this.isFieldAllowedToBeEmpty(field))) {
            if (typeof temp[key] === `string` && !temp[key].trim().length) {
                payload[key] = undefined;
            } else if (Array.isArray(temp[key])) {
                continue;
            } else if (typeof temp[key] === `object` && !!temp[key]) {
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
            `title`,
            `email`,
            `first_name`,
            `last_name`,
            `comment_$`,
            `about_me_$`,
            `number_$`,
            `structure_level_$`,
            `default_number`,
            `default_structure_level`
        ];
        return fields.includes(field);
    }

    public preventAlterationOnDemoUsers(users: Identifiable | Identifiable[]): void {
        if (Array.isArray(users)) {
            if (this._demoModeUserIds && users.map(user => user.id).intersect(this._demoModeUserIds).length > 0) {
                this.preventInDemo();
            }
        } else if (this._demoModeUserIds?.some(userId => userId === users.id)) {
            this.preventInDemo();
        }
    }

    private preventInDemo(): void {
        if (this._demoModeUserIds && this._demoModeUserIds.length) {
            throw new PreventedInDemoError();
        }
    }
}
