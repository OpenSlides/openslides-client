import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { GetUserScopePresenterService } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Injectable({
    providedIn: `root`
})
export class UserService {
    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private presenter: GetUserScopePresenterService,
        private operator: OperatorService
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
        if (!this.activeMeetingService.meeting) {
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

    /**
     * Checks, if the passed users (given by their ids) are in the same scope as the operator and returns the result.
     *
     * @param userIds The id of every user to check
     *
     * @returns A boolean whether every given user is in the same scope as the operator
     */
    public async isUserInSameScope(...userIds: Id[]): Promise<boolean> {
        const result = await this.presenter.call({ user_ids: [...userIds, this.operator.operatorId!] });
        const ownScope = result[this.operator.operatorId!];
        return !Object.keys(result)
            .map(userId => parseInt(userId, 10))
            .some(userId => {
                const toCompare = result[userId];
                return this.presenter.compareScope(ownScope, toCompare) === -1;
            });
    }
}
