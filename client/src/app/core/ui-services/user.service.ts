import { Injectable } from '@angular/core';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';

import { OperatorService } from '../core-services/operator.service';
import { OML } from '../core-services/organization-permission';
import { Permission } from '../core-services/permission';
import { Presenter, PresenterService } from '../core-services/presenter.service';
import { Id } from '../definitions/key-types';

/**
 * Form control names that are editable for all users even if they have no permissions to manage users.
 */
export const PERSONAL_FORM_CONTROLS = [`username`, `email`, `about_me`];

@Injectable({
    providedIn: `root`
})
export class UserService {
    public constructor(
        private operator: OperatorService,
        private activeMeetingId: ActiveMeetingIdService,
        private presenter: PresenterService
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
        if (!this.activeMeetingId.meetingId) {
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

    public async isUserInScope(...userIds: Id[]): Promise<boolean> {
        try {
            await this.presenter.call(Presenter.GET_USER_RELATED_MODELS, { user_ids: userIds });
            return true;
        } catch (e) {
            return false;
        }
    }
}
