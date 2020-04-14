import { Id } from 'app/core/definitions/key-types';
import { BaseDecimalModel } from '../base/base-decimal-model';

export type VoteValue = 'Y' | 'N' | 'A';

export const VoteValueVerbose = {
    Y: 'Yes',
    N: 'No',
    A: 'Abstain'
};

export const GeneralValueVerbose = {
    votesvalid: 'Valid votes',
    votesinvalid: 'Invalid votes',
    votescast: 'Total votes cast',
    votesno: 'Votes No',
    votesabstain: 'Votes abstain'
};

export interface UserVote {
    // the voting payload is hard to describe.
    // Can be "VoteValue" or any userID-Number sequence in combination with any VoteValue
    data: Object;
    user_id?: number;
}

export abstract class BaseVote<T = any> extends BaseDecimalModel<T> {
    public id: Id;
    public weight: number;
    public value: VoteValue;

    public option_id: Id; // (assignment|motion)_option/vote_ids;
    public user_id?: Id; // user/(assignment|motion)_vote_$<meeting_id>_ids;
    public delegated_user_id?: Id; // user/(assignment|motion)_delegated_vote_$_ids;

    public get valueVerbose(): string {
        return VoteValueVerbose[this.value];
    }

    protected getDecimalFields(): string[] {
        return ['weight'];
    }
}
