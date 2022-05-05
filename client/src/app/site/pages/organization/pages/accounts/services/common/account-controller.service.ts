import { Injectable } from '@angular/core';
import { BaseController } from 'src/app/site/base/base-controller';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { User } from 'src/app/domain/models/users/user';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { GetActiveUsersAmountPresenterService, GetUsersPresenterService } from 'src/app/gateways/presenter';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Id } from 'src/app/domain/definitions/key-types';
import { SimplifiedModelRequest } from 'src/app/site/services/model-request-builder';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { Identifiable } from 'src/app/domain/interfaces';
import { Action } from 'src/app/gateways/actions';
import { AccountCommonServiceModule } from './account-common-service.module';
import { UserDeleteDialogService } from 'src/app/ui/modules/user-components';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: AccountCommonServiceModule
})
export class AccountControllerService extends BaseController<ViewUser, User> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private operator: OperatorService,
        private activeUsersPresenter: GetActiveUsersAmountPresenterService,
        private usersPresenter: GetUsersPresenterService,
        private userController: UserControllerService,
        private userDeleteDialog: UserDeleteDialogService
    ) {
        super(controllerServiceCollector, User, repo);
    }

    public bulkAddUserToMeeting(users: ViewUser[], meeting: ViewMeeting): Action<void> {
        const patchFn = (user: ViewUser) => {
            return {
                id: user.id,
                group_$_ids: {
                    [meeting.id]: [meeting.default_group_id]
                }
            };
        };
        return this.repo.update(patchFn, ...users);
    }

    public bulkRemoveUserFromMeeting(users: ViewUser[], meeting: Identifiable): Action<void> {
        const patchFn = (user: ViewUser) => {
            return {
                id: user.id,
                group_$_ids: {
                    [meeting.id]: []
                }
            };
        };
        return this.repo.update(patchFn, ...users);
    }

    public async doDeleteOrRemove(toDelete: ViewUser[]): Promise<boolean> {
        const prompt = await this.userDeleteDialog.open({ toDelete, toRemove: [] });
        const answer = await firstValueFrom(prompt.afterClosed());
        if (answer) {
            await this.repo.delete(...toDelete).resolve();
        }
        return answer as boolean;
    }

    // /**
    //  * This function fetches from the backend a specified amount of ids from all orga-wide stored users.
    //  *
    //  * @param start_index The index of the first id
    //  * @param entries The amount of ids
    //  *
    //  * @returns A list of ids from users
    //  */
    // public async fetchAccountIds(start_index: number = 0, entries: number = 1000): Promise<Id[]> {
    //     if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
    //         return [];
    //     }
    //     return await this.usersPresenter.call({ start_index, entries });
    // }

    // /**
    //  * Fetches the amount of all active users from backend
    //  *
    //  * TODO: Waits for backend
    //  * @returns the number of active users
    //  */
    // public async fetchAllActiveUsers(): Promise<number> {
    //     if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
    //         return -1;
    //     }
    //     return await this.activeUsersPresenter.call();
    // }
}
