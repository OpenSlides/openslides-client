import { Injectable } from '@angular/core';
import { MeetingPollSetting } from '@app/domain/models/meetings/meeting-poll-setting';
import { ViewMeetingPollSetting } from '@app/site/pages/meetings/view-models/view-meeting-poll-setting';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class MeetingPollSettingRepositoryService extends BaseMeetingRelatedRepository<
    ViewMeetingPollSetting,
    MeetingPollSetting
> {
    public baseModelCtor = MeetingPollSetting;

    public getTitle = (_viewMeetingPollDefault: ViewMeetingPollSetting): string => `Meeting poll setting`;

    public getVerboseName = (): string => this.translate.instant(`Meeting poll setting`);
}
