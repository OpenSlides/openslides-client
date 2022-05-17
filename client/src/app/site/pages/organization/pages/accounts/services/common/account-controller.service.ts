import { Injectable } from '@angular/core';
import { BaseController } from 'src/app/site/base/base-controller';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { User } from 'src/app/domain/models/users/user';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
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
}
