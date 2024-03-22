import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { GetUserScopePresenterService } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MeetingControllerService } from '../pages/meetings/services/meeting-controller.service';

export enum UserScope {
    MEETING = `meeting`,
    COMMITTEE = `committee`,
    ORGANIZATION = `organization`
}

@Injectable({
    providedIn: `root`
})
export class UserService {
    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private presenter: GetUserScopePresenterService,
        private operator: OperatorService,
        private meetingRepo: MeetingControllerService
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
     * - seeSensitiveData (mail, username, saml_id, last_email_sent) (ownPage, user.can_see_sensible_data)
     * - manage         (everything) (user.can_manage)
     * - changePersonal (mail, username, about) (user.can_manage or ownPage)
     * - changePassword (user.can_change_password)
     *
     * @param action the action the user tries to perform
     */
    public isAllowed(action: string, isOwnPage: boolean): boolean {
        if ([`seePersonal`, `seeName`, `changePersonal`, `seeSensitiveData`].includes(action) && isOwnPage === true) {
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
            case `update`:
            case `changePersonal`:
            case `seePersonal`:
                return this.operator.hasPerms(Permission.userCanUpdate);
            case `seeSensitiveData`:
                return this.operator.hasPerms(Permission.userCanSeeSensitiveData);
            case `seeName`:
            case `seeOtherUsers`:
                return this.operator.hasPerms(Permission.userCanSee, Permission.userCanUpdate);
            case `changePassword`:
                return (
                    (isOwnPage && this.operator.canChangeOwnPassword) ||
                    this.operator.hasPerms(Permission.userCanUpdate)
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
     * @returns A boolean whether every given user is in the same scope as the operator, if there are no users or only the operator is given, it will always be true
     */
    public async isUserInSameScope(...userIds: Id[]): Promise<boolean> {
        userIds = userIds.filter(id => id !== this.operator.operatorId);
        if (!userIds.length) {
            return true;
        }
        const result = await this.presenter.call({ user_ids: [...userIds, this.operator.operatorId!] });
        const ownScope = result[this.operator.operatorId!];
        return !Object.keys(result)
            .map(userId => parseInt(userId, 10))
            .some(userId => {
                const toCompare = result[userId];
                return (
                    this.presenter.compareScope(ownScope, toCompare) === -1 ||
                    (ownScope.collection === toCompare.collection && ownScope.id !== toCompare.id)
                );
            });
    }

    /**
     * Checks, if the operator has the correct perms to edit the passed users (given by their ids) in accordance with their scopes.
     * May not return true if a meeting scope outside of the current meeting is returned, even if the operator has the correct permission.
     *
     * @param userIds The id of every user to check
     *
     * @returns A boolean that shows whether the given users can have their orga fields edited by the operator
     */
    public async hasScopeManagePerms(...userIds: Id[]): Promise<boolean> {
        const result = await this.presenter.call({ user_ids: [...userIds] });
        return Object.keys(result)
            .map(userId => parseInt(userId, 10))
            .every(userId => {
                const toCompare = result[userId];
                let hasPerms = this.operator.hasOrganizationPermissions(toCompare.user_oml || OML.can_manage_users);
                if (!hasPerms && toCompare.collection === UserScope.COMMITTEE) {
                    hasPerms = hasPerms || this.operator.hasCommitteePermissions(toCompare.id, CML.can_manage);
                }
                if (!hasPerms && toCompare.collection === UserScope.MEETING) {
                    const committee_id = this.meetingRepo.getViewModel(toCompare.id)?.committee_id;
                    hasPerms =
                        hasPerms ||
                        this.operator.hasPermsInMeeting(toCompare.id, Permission.userCanManage) ||
                        (committee_id && this.operator.hasCommitteePermissions(committee_id, CML.can_manage));
                }
                return hasPerms;
            });
    }
}
