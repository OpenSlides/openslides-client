import Big from 'big.js';
import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { HasPoll, SelectionPollResult, ViewPollOption } from '..';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export class ViewPollConfigSelection extends BasePollConfigViewModel<PollConfigSelection, SelectionPollResult> {
    public get poll_config_selection(): PollConfigSelection {
        return this._model;
    }

    public static COLLECTION = PollConfigSelection.COLLECTION;

    public get invalidBallots(): number | null {
        return this.parsedResult()?.invalid ?? null;
    }

    public get onehundredPercentBaseNum(): number | null {
        switch (this.onehundred_percent_base) {
            case 'no_general':
                return this.totalVotesNoGeneral;
            case 'valid':
                return this.validBallots;
            case 'cast':
                return this.poll.ballot_ids.length;
            case 'entitled':
                return null;
            case 'entitled_present':
                return null;
        }

        return null;
    }

    public get totalVotes(): number | null {
        let total = Big(0);
        const result = this.parsedResult();
        if (!result) {
            return null;
        }

        for (const key of Object.keys(result)) {
            if (key === `invalid`) {
                continue;
            }

            total = total.plus(result[key]);
        }

        return total.toNumber();
    }

    public get totalVotesNoGeneral(): number | null {
        let total = Big(0);
        const result = this.parsedResult();
        if (!result) {
            return null;
        }

        for (const key of Object.keys(result)) {
            if (key !== `invalid` && key !== `nota` && key !== `abstain`) {
                total = total.plus(result[key]);
            }
        }

        return total.toNumber();
    }

    protected getResultFromString(result: string): SelectionPollResult {
        return new SelectionPollResult(JSON.parse(result));
    }
}

interface IPollConfigSelectionRelations {
    options: ViewPollOption[];
}
export interface ViewPollConfigSelection
    extends ViewModelRelations<IPollConfigSelectionRelations>, PollConfigSelection, HasPoll {}
