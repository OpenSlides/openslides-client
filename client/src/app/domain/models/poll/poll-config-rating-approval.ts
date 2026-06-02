import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';
import { BaseOnehundredPercentBase } from './poll-config-types';

export type RatingApprovalOnehundredPercentBase = BaseOnehundredPercentBase | `yes_no` | `yes_no_abstain`;

export class PollConfigRatingApproval extends BasePollConfigModel<PollConfigRatingApproval> {
    public static COLLECTION = `poll_config_rating_approval`;

    public max_options_amount!: number;
    public min_options_amount!: number;
    public allow_abstain!: boolean;
    public onehundred_percent_base!: RatingApprovalOnehundredPercentBase;

    public get max_vote_sum(): number {
        return this.max_options_amount;
    }

    public get min_vote_sum(): number {
        return this.min_options_amount;
    }

    public constructor(input?: Partial<PollConfigRatingApproval>) {
        super(PollConfigRatingApproval.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigRatingApproval)[] = [
        `id`,
        `poll_id`,
        `max_options_amount`,
        `min_options_amount`,
        `allow_abstain`,
        `onehundred_percent_base`
    ];
}

export interface PollConfigRatingApproval extends HasMeetingId {}
