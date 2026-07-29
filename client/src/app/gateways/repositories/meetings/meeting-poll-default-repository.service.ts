import { Injectable } from '@angular/core';
import { MeetingPollDefault } from '@app/domain/models/meetings/meeting-poll-default';
import { ViewMeetingPollDefault } from '@app/site/pages/meetings/view-models/view-meeting-poll-default';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class MeetingPollDefaultRepositoryService extends BaseMeetingRelatedRepository<
    ViewMeetingPollDefault,
    MeetingPollDefault
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MeetingPollDefault);
    }

    public getTitle = (_viewMeetingPollDefault: ViewMeetingPollDefault): string => `Meeting poll default`;

    public getVerboseName = (): string => this.translate.instant(`Meeting poll default`);
}
