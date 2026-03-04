type PollMethod = string;
type PollState = string;
type PollType = string;
type PollPercentBase = string;
type EntitledUsersEntry = unknown;
type VoteValue = string;

export class PollVote {
    public weight!: number;
    public value!: VoteValue;

    public option!: PollOption;
    public acting_user_id!: number;
    public represented_user_id!: number;
}

export class PollOption {
    public text!: string;

    public yes!: number;
    public no!: number;
    public abstain!: number;

    public global_option: boolean = false;

    public weight!: number;
}

export class Poll {
    public pollmethod!: PollMethod;
    public state!: PollState;
    public type!: PollType;
    public votesvalid!: number;
    public votesinvalid!: number;
    public votescast!: number;
    public live_votes: Record<number, any> = {};
    public live_voting_enabled: number[] = [];
    public onehundred_percent_base!: PollPercentBase;
    public options: PollOption[] = [];
    public votes: PollVote[] = [];

    public min_votes_amount!: number;
    public max_votes_amount!: number;
    public max_votes_per_option!: number;

    public global_yes!: boolean;
    public global_no!: boolean;
    public global_abstain!: boolean;

    public entitled_users_at_stop!: EntitledUsersEntry[];
    public is_pseudoanonymized!: boolean;
}
