import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';

export class PollConfigRatingScore extends BasePollConfigModel<PollConfigRatingScore> {
    public static COLLECTION = `poll_config_rating_score`;

    public max_options_amount!: number;
    public min_options_amount!: number;
    public max_votes_per_option!: number;
    public max_vote_sum!: number;
    public min_vote_sum!: number;

    public constructor(input?: Partial<PollConfigRatingScore>) {
        super(PollConfigRatingScore.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigRatingScore)[] = [
        `id`,
        `poll_id`,
        `option_ids`,
        `max_options_amount`,
        `min_options_amount`,
        `max_votes_per_option`,
        `max_vote_sum`,
        `min_vote_sum`
    ];
}

export interface PollConfigRatingScore extends HasMeetingId {}
