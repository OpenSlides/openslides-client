import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
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
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { AccountCommonServiceModule } from './account-common-service.module';

@Injectable({
    providedIn: AccountCommonServiceModule
})
export class AccountControllerService extends BaseController<ViewUser, User> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: UserRepositoryService,
        private userDeleteDialog: UserDeleteDialogService,
        private prompt: PromptService,
        private operator: OperatorService
    ) {
        super(controllerServiceCollector, User, repo);
    }

    public bulkAddUserToMeeting(users: ViewUser[], ...meetings: ViewMeeting[]): Action<void> {
        const patchFn = (user: ViewUser) => {
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
        const patchFn = (user: ViewUser) => {
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
}
