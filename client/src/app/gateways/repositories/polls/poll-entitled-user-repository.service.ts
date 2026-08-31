import { Injectable } from '@angular/core';
import { PollEntitledUser } from '@app/domain/models/poll/poll-entitled-user';
import { ViewPollEntitledUser } from '@app/site/pages/meetings/pages/polls/view-models/poll-entitled-user';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollEntitledUserRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollEntitledUser,
    PollEntitledUser
> {
    protected baseModelCtor = PollEntitledUser;

    public getTitle = (viewEntitledUser: ViewPollEntitledUser): string =>
        viewEntitledUser.user?.getTitle() ?? `Unknown`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Entitled users` : `Entitled user`);
}
