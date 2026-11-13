import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';
import { BaseOnehundredPercentBase } from '../poll/poll-config-types';
import { PollVisibility } from '../poll/poll-constants';

export class MeetingPollSetting extends BaseModel<MeetingPollSetting> {
    public static COLLECTION = `meeting_poll_setting`;

    public allow_live_voting: boolean;
    public sort_result_by_votes: boolean;

    public method: string; // TODO: Enum
    public required_majority: string; // TODO: Enum
    public visibility: PollVisibility;
    public onehundred_percent_base: BaseOnehundredPercentBase;
    public group_ids: number[];
    public enable_max_yes_votes: boolean;
    public enable_cumulative_voting: boolean;
    public enable_max_options_limit: boolean;
    public enable_live_voting: boolean;

    public constructor(input?: Partial<MeetingPollSetting>) {
        super(MeetingPollSetting.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MeetingPollSetting)[] = [
        `id`,
        `sort_result_by_votes`,
        `allow_live_voting`,
        `enable_max_yes_votes`,
        `enable_cumulative_voting`,
        `enable_max_options_limit`,
        `method`,
        `visibility`,
        `enable_live_voting`,
        `required_majority`,
        `onehundred_percent_base`,
        `group_ids`,
        `meeting_id`
    ];
}

export interface MeetingPollSetting extends HasMeetingId {}
