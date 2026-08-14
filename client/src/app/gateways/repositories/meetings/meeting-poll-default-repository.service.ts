import { Injectable } from '@angular/core';
import { MeetingPollDefault } from '@app/domain/models/meetings/meeting-poll-default';
import { ViewMeetingPollDefault } from '@app/site/pages/meetings/view-models/view-meeting-poll-default';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class MeetingPollDefaultRepositoryService extends BaseMeetingRelatedRepository<
    ViewMeetingPollDefault,
    MeetingPollDefault
> {
    public baseModelCtor = MeetingPollDefault;

    public getTitle = (_viewMeetingPollDefault: ViewMeetingPollDefault): string => `Meeting poll default`;

    public getVerboseName = (): string => this.translate.instant(`Meeting poll default`);
}
