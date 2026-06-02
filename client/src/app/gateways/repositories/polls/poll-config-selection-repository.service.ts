import { Injectable } from '@angular/core';
import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';
import { ViewPollConfigSelection } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-config-selection';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigSelectionRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigSelection,
    PollConfigSelection
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigSelection);
    }

    public getTitle = (_viewPollConfigSelection: ViewPollConfigSelection): string => `Selection poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Selection poll configs` : `Selection poll config`);
}
