import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

export class PollConfigOption extends BaseModel<PollConfigOption> {
    public static COLLECTION = `poll_config_option`;

    public poll_config_id: Id;

    public weight: number;
    public text: number;
    public meeting_user_id: Id;

    public constructor(input?: Partial<PollConfigOption>) {
        super(PollConfigOption.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollConfigOption)[] = [
        `id`,
        `poll_config_id`,
        `weight`,
        `text`,
        `meeting_user_id`
    ];
}

export interface PollConfigOption extends HasMeetingId {}
