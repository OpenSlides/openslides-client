import { Pipe, PipeTransform } from '@angular/core';

import { PollService } from 'app/site/polls/services/poll.service';
import { PollData } from '../models/poll/generic-poll';

/**
 * Uses a number and a ViewPoll-object.
 * Converts the number to the voting percent base using the
 * given 100%-Base option in the poll object
 *
 * returns null if a percent calculation is not possible
 * or the result is 0
 *
 * @example
 * ```html
 * <span> {{ voteYes | pollPercentBase: poll }} </span>
 * ```
 */
@Pipe({
    name: 'pollPercentBase'
})
export class PollPercentBasePipe implements PipeTransform {
    public constructor(private pollService: PollService) {}

    public transform(value: number, poll: PollData): string | null {
        // logic handles over the pollService to avoid circular dependencies
        let voteValueInPercent: string;

        voteValueInPercent = this.pollService.getVoteValueInPercent(value, poll);

        if (voteValueInPercent) {
            return `(${voteValueInPercent})`;
        } else {
            return null;
        }
    }
}
