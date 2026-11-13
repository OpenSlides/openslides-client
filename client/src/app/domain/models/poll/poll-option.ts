import { Fqid, Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class PollOption extends BaseModel<PollOption> {
    public static COLLECTION = `poll_option`;

    public poll_id: Id;

    public weight: number;
    public text: string;
    public content_object_id: Fqid;

    public constructor(input?: Partial<PollOption>) {
        super(PollOption.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollOption)[] = [
        `id`,
        `poll_id`,
        `weight`,
        `text`,
        `content_object_id`
    ];
}

export interface PollOption extends HasMeetingId {}
