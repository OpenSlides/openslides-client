import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { Action } from 'src/app/gateways/actions';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { BaseController } from 'src/app/site/base/base-controller';
import { UserDeleteDialogService } from 'src/app/site/modules/user-components';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AccountCommonServiceModule } from './account-common-service.module';

@Injectable({
    providedIn: AccountCommonServiceModule
})
export class AccountControllerService extends BaseController<ViewUser, User> {
    private _committee_users_set = new Set<Id>();

    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private userDeleteDialog: UserDeleteDialogService,
        private prompt: PromptService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, User, repo);
        this.operator.user.committee_managements$.subscribe(committees => {
            const userIdsSet = new Set(committees.flatMap(committee => committee.user_ids ?? []));
            const userIdsAllChilds = committees
                .flatMap(committee => committee.all_childs ?? [])
                .flatMap(committee => committee.user_ids ?? []);
            for (const id of userIdsAllChilds) {
                userIdsSet.add(id);
            }
            this._committee_users_set = userIdsSet;
        });
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return super
            .getViewModelListObservable()
            .pipe(map(accounts => this.filterAccountsForCommitteeAdmins(accounts)));
    }

    public override getSortedViewModelListObservable(key?: string): Observable<ViewUser[]> {
        return super
            .getSortedViewModelListObservable(key)
            .pipe(map(accounts => this.filterAccountsForCommitteeAdmins(accounts)));
    }

    public override getViewModelList(): ViewUser[] {
        return this.filterAccountsForCommitteeAdmins(super.getViewModelList());
    }

    private filterAccountsForCommitteeAdmins(accounts: ViewUser[]): ViewUser[] {
        if (this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return accounts;
        }
        return accounts.filter(account => this._committee_users_set.has(account.id));
    }

    public bulkAddUserToMeeting(users: ViewUser[], ...meetings: ViewMeeting[]): Action<void> {
        const patchFn = (
            user: ViewUser
        ): {
            id: number;
            meeting_id: number;
            group_ids: number[];
        }[] => {
            return meetings.map(meeting => {
                const groupIds: number[] = user.group_ids(meeting.id);
                return {
                    id: user.id,
                    meeting_id: meeting.id,
                    group_ids: groupIds?.includes(meeting.default_group_id)
                        ? groupIds
                        : (groupIds ?? []).concat(meeting.default_group_id)
                };
            });
        };
        return this.repo.update(patchFn, ...users);
    }

    public async bulkRemoveUserFromMeeting(
        users: ViewUser[],
        ...meetings: Identifiable[]
    ): Promise<Action<void> | void> {
        const patchFn = (
            user: ViewUser
        ): {
            id: number;
            meeting_id: number;
            group_ids: any[];
        }[] => {
            return meetings.map(meeting => ({ id: user.id, meeting_id: meeting.id, group_ids: [] }));
        };
        const title = _(`This action will remove you from one or more meetings.`);
        const content = _(
            `Afterwards you may be unable to regain your status in this meeting on your own. Are you sure you want to do this?`
        );
        if (
            !(
                users.some(user => user.id === this.operator.operatorId) &&
                meetings.some(meeting => this.operator.isInMeeting(meeting.id))
            ) ||
            (await this.prompt.open(title, content))
        ) {
            return this.repo.update(patchFn, ...users);
        }
    }

    public async doDeleteOrRemove(toDelete: ViewUser[]): Promise<boolean> {
        const prompt = await this.userDeleteDialog.open({ toDelete, toRemove: [] });
        const answer = await firstValueFrom(prompt.afterClosed());
        if (answer) {
            await this.repo.delete(toDelete).resolve();
        }
        return answer as boolean;
    }

    public jsonUpload(payload: Record<string, any>): Action<BackendImportRawPreview> {
        return this.repo.accountJsonUpload(payload);
    }

    public import(payload: { id: number; import: boolean }[]): Action<BackendImportRawPreview | void> {
        return this.repo.accountImport(payload);
    }

    public mergeTogether(payload: { id: number; user_ids: number[] }[]): Action<void> {
        return this.repo.mergeTogether(payload);
    }
}
