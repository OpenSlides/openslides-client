import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewUser } from 'app/site/users/models/view-user';

import { MemberDeleteDialogComponent } from '../../management/components/member-delete-dialog/member-delete-dialog.component';
import { Id } from '../definitions/key-types';
import { UserRepositoryService } from '../repositories/users/user-repository.service';
import { PromptService } from '../ui-services/prompt.service';
import { ActiveMeetingService } from './active-meeting.service';
import { SimplifiedModelRequest } from './model-request-builder.service';
import { OperatorService } from './operator.service';
import { CML, OML } from './organization-permission';
import { Presenter, PresenterService } from './presenter.service';

interface GetUsersPresenterResult {
    users: Id[];
}

interface GetActiveUsersPresenterResult {
    active_users_amount: number;
}

export interface GetUserRelatedModelsUser {
    name?: string;
    meetings?: {
        id: Id;
        is_active_in_organization_id: Id;
        name: string;
        candidate_ids: Id[];
        speaker_ids: Id[];
        submitter_ids: Id[];
    }[];
    committees?: GetUserRelatedModelsCommittee[];
}

export interface GetUserRelatedModelsCommittee {
    id: Id;
    name: string;
    cml: CML;
}

export interface GetUserRelatedModelsPresenterResult {
    [user_id: number]: GetUserRelatedModelsUser;
}

@Injectable({
    providedIn: `root`
})
export class MemberService {
    public constructor(
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        private presenter: PresenterService,
        private dialog: MatDialog,
        private activeMeeting: ActiveMeetingService,
        private translate: TranslateService,
        private prompt: PromptService
    ) {}

    public async delete(users: ViewUser[], meeting: Meeting = this.activeMeeting.meeting): Promise<boolean> {
        try {
            return await this.doDeleteByPresenter(users);
        } catch (e) {
            return await this.doRemoveFromMeeting(users, meeting);
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
            follow: [{ idField: `committee_ids` }, { idField: `is_present_in_meeting_ids` }]
        };
    }

    private async doDeleteByPresenter(users: ViewUser[]): Promise<boolean> {
        const data = await this.presenter.call<GetUserRelatedModelsPresenterResult>(Presenter.GET_USER_RELATED_MODELS, {
            user_ids: users.map(user => user.id)
        });

        for (const user of users) {
            data[user.id].name = user.getFullName();
        }

        const promptDialog = this.dialog.open(MemberDeleteDialogComponent, { ...mediumDialogSettings, data });
        if (await promptDialog.afterClosed().toPromise()) {
            await this.doDelete(users);
            return true;
        } else {
            return false;
        }
    }

    private async doDelete(users: ViewUser[]): Promise<void> {
        try {
            await this.userRepo.delete(...users);
        } catch (e) {
            await this.userRepo.update({ is_active: false }, ...users);
        }
    }

    private async doRemoveFromMeeting(users: ViewUser[], meeting: Meeting): Promise<boolean> {
        const title = this.translate.instant(
            `Are you sure you want to remove ${
                users.length === 1 ? `this participant` : `these participants`
            } from this meeting?`
        );
        const content = users.map(user => user.getShortName()).join(`, `);
        if (await this.prompt.open(title, content)) {
            await this.userRepo.bulkRemoveGroupsFromUsers(users, meeting.group_ids);
            return true;
        } else {
            return false;
        }
    }
}
