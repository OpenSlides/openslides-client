import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';

export class PollConfigRatingApproval extends BasePollConfigModel<PollConfigRatingApproval> {
    public static COLLECTION = `poll_config_rating_approval`;

    public max_options_amount!: number;
    public min_options_amount!: number;
    public allow_abstain!: boolean;

    public constructor(input?: Partial<PollConfigRatingApproval>) {
        super(PollConfigRatingApproval.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigRatingApproval)[] = [
        `id`,
        `poll_id`,
        `option_ids`,
        `max_options_amount`,
        `min_options_amount`,
        `allow_abstain`
    ];
}

export interface PollConfigRatingApproval extends HasMeetingId {}
