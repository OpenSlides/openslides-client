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
        `meeting_id`,
        `poll_id`,
        `acting_meeting_user_id`,
        `represented_meeting_user_id`
    ];
}

export interface Ballot extends HasMeetingId {}
