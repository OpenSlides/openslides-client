import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewUser } from 'app/site/users/models/view-user';

import { MemberDeleteDialogComponent } from '../../management/components/member-delete-dialog/member-delete-dialog.component';
import { Id } from '../definitions/key-types';
import { UserRepositoryService } from '../repositories/users/user-repository.service';
import { ActiveMeetingService } from './active-meeting.service';
import { SimplifiedModelRequest } from './model-request-builder.service';
import { OperatorService } from './operator.service';
import { OML } from './organization-permission';
import { Presenter, PresenterService } from './presenter.service';
import { GetUserRelatedModelsPresenterService } from './presenters/get-user-related-models-presenter.service';

interface GetUsersPresenterResult {
    users: Id[];
}

interface GetActiveUsersPresenterResult {
    active_users_amount: number;
}

interface MemberDeleteConfig {
    toDelete: ViewUser[];
    toRemove: ViewUser[];
    meeting?: ViewMeeting;
}

@Injectable({
    providedIn: `root`
})
export class MemberService {
    private get activeMeeting(): ViewMeeting {
        return this.activeMeetingService.meeting;
    }

    public constructor(
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        private presenter: PresenterService,
        private userRelatedModelsPresenter: GetUserRelatedModelsPresenterService,
        private dialog: MatDialog,
        private activeMeetingService: ActiveMeetingService
    ) {}

    public async doDeleteOrRemove({
        toDelete,
        toRemove,
        meeting = this.activeMeeting
    }: MemberDeleteConfig): Promise<boolean> {
        const payload = { user_ids: toDelete.map(user => user.id) };
        const toDeleteData = await this.userRelatedModelsPresenter.call(payload);

        for (const user of toDelete) {
            toDeleteData[user.id].name = user.getFullName();
        }

        const data = { toDelete: toDeleteData, toRemove };

        const promptDialog = this.dialog.open(MemberDeleteDialogComponent, { ...mediumDialogSettings, data });
        if (await promptDialog.afterClosed().toPromise()) {
            const action = this.userRepo
                .delete(...toDelete)
                .concat(this.userRepo.bulkRemoveUserFromMeeting(toRemove, meeting));
            await action.resolve();
            return true;
        } else {
            return false;
        }
    }

    /**
     * This function fetches from the backend a specified amount of ids from all orga-wide stored users.
     *
     * @param start_index The index of the first id
     * @param entries The amount of ids
     *
     * @returns A list of ids from users
     */
    public async fetchAllOrgaUsers(start_index: number = 0, entries: number = 10000): Promise<Id[]> {
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return [];
        }
        const payload = { start_index, entries };
        const response = await this.presenter.call<GetUsersPresenterResult>(Presenter.GET_USERS, payload);
        return response.users;
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
        const response = await this.presenter.call<GetActiveUsersPresenterResult>(Presenter.GET_ACTIVE_USER_AMOUNT, {});
        return response.active_users_amount;
    }

    /**
     * Fetches a specified amount of ids from all orga-wide stored users and creates a `SimplifiedModelRequest` to
     * follow them and receive autoupdates.
     *
     * @param start_index The index of the first id
     * @param entries The amount of ids
     *
     * @returns A promise resolving a `SimplifiedModelRequest`
     */
    public async getAllOrgaUsersModelRequest(
        start_index: number = 0,
        entries: number = 10000
    ): Promise<SimplifiedModelRequest> {
        const userIds = await this.fetchAllOrgaUsers(start_index, entries);
        return {
            viewModelCtor: ViewUser,
            ids: userIds,
            fieldset: `orgaList`,
            follow: [{ idField: `is_present_in_meeting_ids` }]
        };
    }
}
