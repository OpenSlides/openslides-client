import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';
import { BaseOnehundredPercentBase } from './poll-config-types';

export type ApprovalOnehundredPercentBase = BaseOnehundredPercentBase | `yes_no`;

export class PollConfigApproval extends BasePollConfigModel<PollConfigApproval> {
    public static COLLECTION = `poll_config_approval`;

    public allow_abstain!: boolean;
    public onehundred_percent_base!: ApprovalOnehundredPercentBase;

    public constructor(input?: Partial<PollConfigApproval>) {
        super(PollConfigApproval.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigApproval)[] = [
        `id`,
        `poll_id`,
        `allow_abstain`,
        `onehundred_percent_base`
    ];
}

export interface PollConfigApproval extends HasMeetingId {}
