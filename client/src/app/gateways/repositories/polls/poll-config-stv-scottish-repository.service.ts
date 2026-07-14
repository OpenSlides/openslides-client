import { Injectable } from '@angular/core';
import { PollConfigStvScottish } from '@app/domain/models/poll/poll-config-stv-scottish';
import { ViewPollConfigStvScottish } from '@app/site/pages/meetings/pages/polls/view-models/poll-config-stv-scottish';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigStvScottishRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigStvScottish,
    PollConfigStvScottish
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigStvScottish);
    }

    public getTitle = (_viewPollConfigStvScottish: ViewPollConfigStvScottish): string => `STV (Scottish) poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `STV (Scottish) poll configs` : `STV (Scottish) poll config`);
}
