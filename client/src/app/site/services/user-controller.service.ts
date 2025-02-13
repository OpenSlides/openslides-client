import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { GetActiveUsersAmountPresenterService } from 'src/app/gateways/presenter';
import {
    AssignMeetingsPayload,
    AssignMeetingsResult,
    EmailSentResult,
    ExtendedUserPatchFn,
    ShortNameInformation,
    UserPatchFn,
    UserRepositoryService
} from 'src/app/gateways/repositories/users';
import { OperatorService } from 'src/app/site/services/operator.service';

import { Identifiable } from '../../domain/interfaces';
import { User } from '../../domain/models/users/user';
import { Action } from '../../gateways/actions';
import { BaseController } from '../base/base-controller';
import { ViewUser } from '../pages/meetings/view-models/view-user';
import { ControllerServiceCollectorService } from './controller-service-collector.service';

/**
 * type for determining the user name from a string during import.
 * See {@link parseUserString} for implementations
 */
type StringNamingSchema = 'lastCommaFirst' | 'firstSpaceLast';

export interface CreateUserNameInformation {
    username: string;
    first_name?: string;
    last_name?: string;
    pronoun?: string;
    title?: string;
}

@Injectable({
    providedIn: `root`
})
export class UserControllerService extends BaseController<ViewUser, User> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private presenter: GetActiveUsersAmountPresenterService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, User, repo);
    }

    ///////////////////
    /////////////////// TODO: Remove, because participants and accounts have their dedicated "controller"

    public create(...payload: any[]): Promise<Identifiable[]> {
        return this.repo.create(...payload);
    }

    public update(patch: ExtendedUserPatchFn, ...users: ViewUser[]): Action<void> {
        return this.repo.update(patch, ...users);
    }

    public updateSelf(patch: UserPatchFn, user: ViewUser): Promise<void> {
        return this.repo.updateSelf(patch, user);
    }

    public async delete(...userIds: Identifiable[]): Promise<void> {
        await this.repo.delete(userIds).resolve();
    }

    public setPassword(user: Identifiable, password: string, setAsDefault?: boolean): Promise<void> {
        return this.repo.setPassword(user, password, setAsDefault);
    }

    public async setPasswordSelf(user: Identifiable, oldPassword: string, newPassword: string): Promise<any> {
        const result = await this.repo.setPasswordSelf(user, oldPassword, newPassword);
        if (result === null) {
            return { success: true };
        }

        return result;
    }

    public resetPasswordToDefault(...users: Identifiable[]): Promise<void> {
        return this.repo.resetPasswordToDefault(users);
    }

    public getGeneralViewModelObservable(): Observable<ViewUser> {
        return this.repo.getGeneralViewModelObservable();
    }

    public getShortName(user: ShortNameInformation): string {
        return this.repo.getShortName(user);
    }

    public generateNewPasswords(users: Identifiable[]): Promise<void> {
        return this.repo.bulkGenerateNewPasswords(users);
    }

    public assignMeetings(user: Identifiable, data: AssignMeetingsPayload): Action<AssignMeetingsResult> {
        return this.repo.assignMeetings(user, data);
    }

    /////////////////////////////
    /////////////////////////////
    /////////////////////////////

    public forgetPassword(email: string): Promise<void> {
        return this.repo.forgetPassword(email);
    }

    public forgetPasswordConfirm(payload: {
        user_id: Id;
        authorization_token: string;
        new_password: string;
    }): Promise<void> {
        return this.repo.forgetPasswordConfirm(payload);
    }

    public setPresent(context: { isPresent: boolean; meetingId: Id; users: Identifiable[] }): Action<void> {
        return this.repo.setPresent(context);
    }

    /**
     * Generates a random password
     *
     * @param length The length of the password to generate
     * @returns a random password
     */
    public getRandomPassword(length = 10): string {
        let pw = ``;
        const characters = `abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789`;
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
     * Tries to convert a given string into an user (representated by a `CreateUserNameInformation`-object).
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
     * @returns A `CreateUserNameInformation`-object.
     */
    public parseStringIntoUser(
        inputUser: string,
        schema: StringNamingSchema = `firstSpaceLast`
    ): CreateUserNameInformation {
        const newUser: CreateUserNameInformation = {
            username: ``,
            first_name: ``,
            last_name: ``
        };
        const assignName = (nameParts: string[]): void => {
            switch (nameParts.length) {
                case 1:
                    newUser.first_name = nameParts[0];
                    break;
                case 2:
                    newUser.first_name = nameParts[0];
                    newUser.last_name = nameParts[1];
                    break;
                default:
                    newUser.first_name = inputUser;
            }
        };
        if (schema === `lastCommaFirst`) {
            const commaSeparated = inputUser.split(`,`);
            assignName(commaSeparated.slice().reverse());
        } else if (schema === `firstSpaceLast`) {
            const splitUser = inputUser.split(` `);
            assignName(splitUser);
        }
        newUser.username = newUser.first_name! + newUser.last_name!;
        return newUser;
    }

    /**
     * Fetches the amount of all active users from backend
     *
     * TODO: Waits for backend
     * @returns the number of active users
     */
    public async fetchAllActiveUsers(): Promise<number> {
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return -1;
        }
        return await this.presenter.call();
    }

    public async sendInvitationEmails(users: Identifiable[], meetingId?: Id): Promise<string> {
        const response = (await this.repo.sendInvitationEmails(users, meetingId).resolve()) as EmailSentResult[];

        const numEmails = response.filter(email => email.sent).length;
        const noEmails = response.filter(email => !email.sent && email.type === `user_error`);
        const notSent = response.filter(email => !email.sent);
        let responseMessage: string;
        if (numEmails === 0) {
            responseMessage = this.translate.instant(`No emails were send.`);
        } else if (numEmails === 1) {
            responseMessage = this.translate.instant(`One email was send sucessfully.`);
        } else {
            responseMessage = this.translate.instant(`%num% emails were send sucessfully.`);
            responseMessage = responseMessage.replace(`%num%`, numEmails.toString());
        }

        if (noEmails.length) {
            responseMessage += ` `;

            if (noEmails.length === 1) {
                responseMessage += this.translate.instant(
                    `The user %user% has no email, so the invitation email could not be sent.`
                );
            } else {
                responseMessage += this.translate.instant(
                    `The users %user% have no email, so the invitation emails could not be sent.`
                );
            }

            // This one builds a username string like "user1, user2 and user3" with the full names.
            const usernames = noEmails
                .map(email => this.getViewModel(email.recipient_user_id))
                .filter(user => !!user)
                .map(user => user!.short_name);
            let userString: string;
            if (usernames.length > 1) {
                const lastUsername = usernames.pop();
                userString = usernames.join(`, `) + ` ` + this.translate.instant(`and`) + ` ` + lastUsername;
            } else {
                userString = usernames.join(`, `);
            }
            responseMessage = responseMessage.replace(`%user%`, userString);
        }

        if (notSent > noEmails) {
            responseMessage += this.translate.instant(
                `Some mails could not be sent. There may be a problem communicating with the mail server, please contact your admin.`
            );
        }

        return responseMessage;
    }
}
