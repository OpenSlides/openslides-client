import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';
import { BaseOnehundredPercentBase } from './poll-config-types';

export type RatingScoreOnehundredPercentBase = BaseOnehundredPercentBase | `yes_no`;

export class PollConfigRatingScore extends BasePollConfigModel<PollConfigRatingScore> {
    public static COLLECTION = `poll_config_rating_score`;

    public max_options_amount!: number;
    public min_options_amount!: number;
    public max_votes_per_option!: number;
    public max_vote_sum!: number;
    public min_vote_sum!: number;
    public onehundred_percent_base!: RatingScoreOnehundredPercentBase;

    public constructor(input?: Partial<PollConfigRatingScore>) {
        super(PollConfigRatingScore.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigRatingScore)[] = [
        `id`,
        `poll_id`,
        `max_options_amount`,
        `min_options_amount`,
        `max_votes_per_option`,
        `max_vote_sum`,
        `min_vote_sum`,
        `onehundred_percent_base`
    ];
}

export interface PollConfigRatingScore extends HasMeetingId {}
