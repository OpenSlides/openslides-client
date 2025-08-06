import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';
import { VoteValue, VoteValueVerbose } from './vote-constants';

export class Vote extends BaseModel<Vote> {
    public static COLLECTION = `vote`;

    public weight!: number;
    public value!: VoteValue;

    public option_id!: Id; // (assignment|motion)_option/vote_ids;
    public user_id!: Id; // user/vote_ids;
    /** Id of the MeetingUser the vote got delegated to */
    public delegated_user_id!: Id; // meeting_user/vote_delegated_vote_ids;
    public user_token!: string;

    public get valueVerbose(): string {
        return VoteValueVerbose[this.value];
    }

    public constructor(input?: Partial<Vote>) {
        super(Vote.COLLECTION, input);
    }

    protected getDecimalFields(): string[] {
        return [`weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Vote)[] = [
        `id`,
        `weight`,
        `value`,
        `user_token`,
        `option_id`,
        `user_id`,
        `delegated_user_id`,
        `meeting_id`
    ];
}

export interface Vote extends HasMeetingId {}
