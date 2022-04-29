export interface PollDialogResult {
    amount_global_yes?: string;
    amount_global_no?: string;
    amount_global_abstain?: string;
    votesvalid?: string;
    votesinvalid?: string;
    votescast?: string;
    options: { [key: string]: { Y?: string; N?: string; A?: string } };
}
