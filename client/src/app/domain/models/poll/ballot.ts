import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';
import { VoteValue, VoteValueVerbose } from './vote-constants';

export class Ballot extends BaseModel<Ballot> {
    public static COLLECTION = `ballot`;

    public weight: number;
    public split: boolean;
    public value: VoteValue;

    public poll_id!: Id;
    public acting_meeting_user_id: Id;
    public represented_meeting_user_id: Id;

    public option_id!: Id; // TODO: Remove
    public user_id!: Id; // TODO: Remove

    /** Id of the MeetingUser the vote got delegated to */
    public delegated_user_id!: Id; // TODO: Remove
    public user_token!: string; // TODO: Remove

    public get valueVerbose(): string {
        return VoteValueVerbose[this.value];
    }

    public constructor(input?: Partial<Ballot>) {
        super(Ballot.COLLECTION, input);
    }

    protected getDecimalFields(): string[] {
        return [`weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Ballot)[] = [
        `id`,
        `weight`,
        `split`,
        `value`,
        `poll_id`,
        `acting_meeting_user_id`,
        `represented_meeting_user_id`
    ];
}

export interface Ballot extends HasMeetingId {}
