import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { PollOption } from 'src/app/domain/models/poll/poll-option';
import { ViewPollOption } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-option';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollOptionRepositoryService extends BaseMeetingRelatedRepository<ViewPollOption, PollOption> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollOption);
    }

    public getTitle = (viewPollOption: ViewPollOption): string =>
        viewPollOption.meeting_user_id ? viewPollOption.meeting_user.getTitle() : viewPollOption.text;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? _(`Poll options`) : _(`Poll option`));
}
