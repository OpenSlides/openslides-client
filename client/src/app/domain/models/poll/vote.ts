import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';
import { VoteValue, VoteValueVerbose } from './vote-constants';

export class Vote extends BaseModel<Vote> {
    public static COLLECTION = `vote`;

    public weight!: number;
    public value!: VoteValue;

    public option_id!: Id; // (assignment|motion)_option/vote_ids;
    public user_id!: Id; // user/(assignment|motion)_vote_$<meeting_id>_ids;
    public delegated_user_id!: Id; // user/(assignment|motion)_delegated_vote_$_ids;
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
}

export interface Vote extends HasMeetingId {}
