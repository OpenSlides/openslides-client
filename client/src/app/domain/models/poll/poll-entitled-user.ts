import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export class PollEntitledUser extends BaseModel<PollEntitledUser> {
    public static COLLECTION = `poll_entitled_user`;

    public poll_id!: Id;
    public meeting_user_id: Id;

    public constructor(input?: Partial<PollEntitledUser>) {
        super(PollEntitledUser.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollEntitledUser)[] = [`id`, `poll_id`, `meeting_user_id`];
}
