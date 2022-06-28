import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { Action } from 'src/app/gateways/actions';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { BaseController } from 'src/app/site/base/base-controller';
import { UserDeleteDialogService } from 'src/app/site/modules/user-components';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

import { AccountCommonServiceModule } from './account-common-service.module';

@Injectable({
    providedIn: AccountCommonServiceModule
})
export class AccountControllerService extends BaseController<ViewUser, User> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private userDeleteDialog: UserDeleteDialogService
    ) {
        super(controllerServiceCollector, User, repo);
    }

    public bulkAddUserToMeeting(users: ViewUser[], ...meetings: ViewMeeting[]): Action<void> {
        const patchFn = (user: ViewUser) => {
            return {
                id: user.id,
                group_$_ids: meetings.mapToObject(meeting => ({ [meeting.id]: [meeting.default_group_id] }))
            };
        };
        return this.repo.update(patchFn, ...users);
    }

    public bulkRemoveUserFromMeeting(users: ViewUser[], ...meetings: Identifiable[]): Action<void> {
        const patchFn = (user: ViewUser) => {
            return {
                id: user.id,
                group_$_ids: meetings.mapToObject(meeting => ({ [meeting.id]: [] }))
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
}
