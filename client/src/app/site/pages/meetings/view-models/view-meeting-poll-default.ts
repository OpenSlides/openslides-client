import { MeetingPollDefault } from '@app/domain/models/meetings/meeting-poll-default';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewGroup } from '../pages/participants';
import { ViewMeeting } from './view-meeting';

export class ViewMeetingPollDefault extends BaseViewModel<MeetingPollDefault> {
    public static COLLECTION = MeetingPollDefault.COLLECTION;

    protected _collection = MeetingPollDefault.COLLECTION;
}
interface IMeetingPollDefaultRelations {
    meeting: ViewMeeting;
    groups: ViewGroup[];
}

export interface ViewMeetingPollDefault extends MeetingPollDefault, ViewModelRelations<IMeetingPollDefaultRelations> {}
