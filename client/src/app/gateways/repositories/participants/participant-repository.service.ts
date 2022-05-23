import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { Action } from 'src/app/gateways/actions';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { UserRepositoryService } from '../users';
import { UserAction } from '../users/user-action';

@Injectable({
    providedIn: `root`
})
export class ParticipantRepositoryService extends BaseMeetingRelatedRepository<ViewUser, User> {
    protected override translate: TranslateService;

    constructor(private userRepo: UserRepositoryService) {
        super(User);
    }

    public override getViewModel(participantId: Id): ViewUser | null {
        return this.userRepo.getViewModel(participantId);
    }

    public override getViewModelObservable(id: Id): Observable<ViewUser | null> {
        return this.userRepo.getViewModelObservable(id);
    }

    public override getViewModelList(): ViewUser[] {
        return this.userRepo.getViewModelList();
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return this.userRepo.getViewModelListObservable();
    }

    public getVerboseName = (plural?: boolean): string => this.userRepo.getVerboseName(plural);

    public getTitle = (user: ViewUser): string => this.userRepo.getTitle(user);

    public togglePresenceByNumber(...numbers: string[]): Promise<Identifiable[]> {
        const payload = numbers.map(number => ({
            meeting_id: this.activeMeetingId,
            number
        }));
        return this.createAction<Identifiable>(UserAction.TOGGLE_PRESENCE_BY_NUMBER, payload).resolve() as any;
    }

    public async sendInvitationEmails(
        users: Identifiable[],
        meetingIds: Ids = [this.activeMeetingId!]
    ): Promise<string> {
        const response = await this.userRepo.sendInvitationEmails(users, meetingIds);

        const numEmails = response.filter(email => email.sent).length;
        const noEmails = response.filter(email => !email.sent);
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
                    `The user %user% has no email, so the invitation email could not be send.`
                );
            } else {
                responseMessage += this.translate.instant(
                    `The users %user% have no email, so the invitation emails could not be send.`
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

        return responseMessage;
    }

    public bulkAddGroupsToUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => {
            groupIds = groupIds.concat(user.group_ids());
            return {
                id: user.id,
                group_ids: groupIds.filter((groupId, index, self) => self.indexOf(groupId) === index)
            };
        };
        return this.userRepo.update(patchFn, ...users).resolve() as Promise<void>;
    }

    public bulkRemoveGroupsFromUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => ({
            id: user.id,
            group_ids: user.group_ids().filter(groupId => !groupIds.includes(groupId))
        });
        return this.userRepo.update(patchFn, ...users).resolve() as Promise<void>;
    }

    public setPresent(isPresent: boolean, ...users: ViewUser[]): Action<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const payload: any[] = users.map(user => ({
            id: user.id,
            meeting_id: this.activeMeetingId,
            present: isPresent
        }));
        return this.actions.create({ action: UserAction.SET_PRESENT, data: payload });
    }

    public override getFieldsets(): Fieldsets<User> {
        return this.userRepo.getFieldsets();
    }
}
