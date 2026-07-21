import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export class PollBallotUser extends BaseModel<PollBallotUser> {
    public static COLLECTION = `poll_ballot_user`;

    public poll_id!: Id;
    public poll_ballot_id!: Id;
    public acting_meeting_user_id: Id;
    public represented_meeting_user_id: Id;

    public constructor(input?: Partial<PollBallotUser>) {
        super(PollBallotUser.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollBallotUser)[] = [
        `id`,
        `poll_id`,
        `poll_ballot_id`,
        `acting_meeting_user_id`,
        `represented_meeting_user_id`
    ];
}
