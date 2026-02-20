import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';

export class PollConfigSelection extends BasePollConfigModel<PollConfigSelection> {
    public static COLLECTION = `poll_config_selection`;

    public max_options_amount!: number;
    public min_options_amount!: number;
    public allow_nota!: boolean;

    public constructor(input?: Partial<PollConfigSelection>) {
        super(PollConfigSelection.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigSelection)[] = [
        `id`,
        `poll_id`,
        `option_ids`,
        `max_options_amount`,
        `min_options_amount`,
        `allow_nota`
    ];
}

export interface PollConfigSelection extends HasMeetingId {}
