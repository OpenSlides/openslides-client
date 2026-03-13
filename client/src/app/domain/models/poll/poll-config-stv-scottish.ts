import { HasMeetingId } from '../../interfaces';
import { BasePollConfigModel } from './base-poll-config';

export class PollConfigStvScottish extends BasePollConfigModel<PollConfigStvScottish> {
    public static COLLECTION = `poll_config_stv_scottish`;

    public posts!: number;

    public constructor(input?: Partial<PollConfigStvScottish>) {
        super(PollConfigStvScottish.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigStvScottish)[] = [
        `id`,
        `poll_id`,
        `option_ids`,
        `posts`
    ];
}

export interface PollConfigStvScottish extends HasMeetingId {}
