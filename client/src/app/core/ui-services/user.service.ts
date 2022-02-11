import { Injectable } from '@angular/core';
import { GetUserScopePresenterService } from 'app/core/core-services/presenters/get-user-scope-presenter.service';
import { ViewUser } from 'app/site/users/models/view-user';

import { ViewMeeting } from '../../management/models/view-meeting';
import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { MemberService } from '../core-services/member.service';
import { OperatorService } from '../core-services/operator.service';
import { OML } from '../core-services/organization-permission';
import { Permission } from '../core-services/permission';
import { Id } from '../definitions/key-types';
import { UserRepositoryService } from '../repositories/users/user-repository.service';

/**
 * Form control names that are editable for all users even if they have no permissions to manage users.
 */
export const PERSONAL_FORM_CONTROLS = [`username`, `email`, `about_me`, `pronoun`];

@Injectable({ providedIn: `root` })
export class UserService {
    private get activeMeeting(): ViewMeeting {
        return this.activeMeetingService.meeting;
    }

    public constructor(
        private operator: OperatorService,
        private userRepo: UserRepositoryService,
        private activeMeetingService: ActiveMeetingService,
        private presenter: GetUserScopePresenterService,
        private memberService: MemberService
    ) {}

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
        if ([`seePersonal`, `seeName`, `changePersonal`].includes(action) && isOwnPage === true) {
            return true;
        }
        if (!this.activeMeeting) {
            return this.operator.hasOrganizationPermissions(OML.can_manage_users);
        }
        switch (action) {
            case `delete`:
                return this.operator.hasPerms(Permission.userCanManage) && !isOwnPage;
            case `manage`:
                return this.operator.hasPerms(Permission.userCanManage);
            case `seeName`:
                return this.operator.hasPerms(Permission.userCanSee, Permission.userCanManage);
            case `seeOtherUsers`:
                return this.operator.hasPerms(Permission.userCanSee, Permission.userCanManage);
            case `seePersonal`:
                return this.operator.hasPerms(Permission.userCanManage);
            case `changePersonal`:
                return this.operator.hasPerms(Permission.userCanManage);
            case `changePassword`:
                return (
                    (isOwnPage && this.operator.canChangeOwnPassword) ||
                    this.operator.hasPerms(Permission.userCanManage)
                );
            default:
                return false;
        }
    }

    public async removeUsersFromMeeting(users: ViewUser[], meeting: ViewMeeting = this.activeMeeting): Promise<void> {
        const result = await this.presenter.call({ user_ids: users.map(user => user.id) });
        const toDelete = Object.keys(result)
            .map(key => parseInt(key, 10))
            .filter(key => {
                const fqid = `${result[key].collection}/${result[key].id}`;
                return fqid === meeting.fqid;
            });
        const toDeleteUsers = toDelete.map(id => this.userRepo.getViewModel(id));
        const toRemove = users.map(user => user.id).difference(toDelete);
        const toRemoveUsers = toRemove.map(id => this.userRepo.getViewModel(id));

        this.memberService.doDeleteOrRemove({ toDelete: toDeleteUsers, toRemove: toRemoveUsers, meeting });
    }

    /**
     * Checks, if the passed users (given by their ids) are in the same scope as the operator and returns the result.
     *
     * @param userIds The id of every user to check
     *
     * @returns A boolean whether the given users are in the same scope as the operator
     */
    public async isUserInSameScope(...userIds: Id[]): Promise<boolean> {
        const result = await this.presenter.call({ user_ids: [...userIds, this.operator.operatorId] });
        const ownScope = result[this.operator.operatorId].collection;
        return !Object.keys(result)
            .map(userId => parseInt(userId, 10))
            .some(userId => {
                const toCompare = result[userId].collection;
                return this.presenter.compareScope(ownScope, toCompare) === -1;
            });
    }
}
