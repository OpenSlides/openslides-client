import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

export class MeetingPollDefault extends BaseModel<MeetingPollDefault> {
    public static COLLECTION = `meeting_poll_default`;

    public sort_result_by_votes: boolean;

    public allow_abstain!: boolean;
    public allow_nota: boolean;
    public visibility: string;
    public strike_out: boolean;
    public onehundred_percent_base: string;
    public group_ids: number[];
    public display_chart: string;

    public constructor(input?: Partial<MeetingPollDefault>) {
        super(MeetingPollDefault.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MeetingPollDefault)[] = [
        `id`,
        `sort_result_by_votes`,
        `visibility`,
        `allow_abstain`,
        `allow_nota`,
        `strike_out`,
        `onehundred_percent_base`,
        `group_ids`,
        `display_chart`,
        `meeting_id`
    ];
}

export interface MeetingPollDefault extends HasMeetingId {}
