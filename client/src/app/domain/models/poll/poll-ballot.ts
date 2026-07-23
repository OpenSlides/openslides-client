import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';
import { VoteValue, VoteValueVerbose } from './vote-constants';

export class PollBallot extends BaseModel<PollBallot> {
    public static COLLECTION = `poll_ballot`;

    public weight: number;
    public split: boolean;
    public value: VoteValue;

    public poll_id!: Id;
    public poll_ballot_user_id: Id;

    public get valueVerbose(): string {
        return VoteValueVerbose[this.value];
    }

    public constructor(input?: Partial<PollBallot>) {
        super(PollBallot.COLLECTION, input);
    }

    protected getDecimalFields(): string[] {
        return [`weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollBallot)[] = [
        `id`,
        `weight`,
        `split`,
        `value`,
        `poll_id`,
        `poll_ballot_user_id`
    ];
}

export interface PollBallot extends HasMeetingId {}
