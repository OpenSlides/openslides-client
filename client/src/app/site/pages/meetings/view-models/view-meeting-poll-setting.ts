import { MeetingPollSetting } from '@app/domain/models/meetings/meeting-poll-setting';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewGroup } from '../pages/participants/modules/groups/view-models/view-group';
import { ViewMeeting } from './view-meeting';

export class ViewMeetingPollSetting extends BaseViewModel<MeetingPollSetting> {
    public static COLLECTION = MeetingPollSetting.COLLECTION;

    protected _collection = MeetingPollSetting.COLLECTION;
}
interface IMeetingPollDefaultRelations {
    meeting: ViewMeeting;
    groups: ViewGroup[];
}

export interface ViewMeetingPollSetting extends MeetingPollSetting, ViewModelRelations<IMeetingPollDefaultRelations> {}
