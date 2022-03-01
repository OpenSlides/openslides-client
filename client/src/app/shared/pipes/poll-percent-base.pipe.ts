import { Pipe, PipeTransform } from '@angular/core';
import { PollService, PollTableData } from 'app/site/polls/services/poll.service';

import { AssignmentPollService } from '../../site/assignments/modules/assignment-poll/services/assignment-poll.service';
import { MotionPollService } from '../../site/motions/services/motion-poll.service';
import { OptionData, PollData } from '../models/poll/generic-poll';
import { PollClassType } from '../models/poll/poll-constants';

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
    name: `pollPercentBase`
})
export class PollPercentBasePipe implements PipeTransform {
    public constructor(
        private pollService: PollService,
        private assignmentPollService: AssignmentPollService,
        private motionPollService: MotionPollService
    ) {}

    public transform(value: number, poll: PollData, row: OptionData | PollTableData): string | null {
        // logic handles over the pollService to avoid circular dependencies
        const voteValueInPercent: string = this.getVoteValueInPercent(value, poll, row);

        if (voteValueInPercent) {
            return `(${voteValueInPercent})`;
        } else {
            return null;
        }
    }

    private getVoteValueInPercent(value: number, poll: PollData, row: OptionData | PollTableData): string {
        switch (poll.pollClassType) {
            case PollClassType.Assignment:
                return this.assignmentPollService.getVoteValueInPercent(value, { poll, row });
            case PollClassType.Motion:
                return this.motionPollService.getVoteValueInPercent(value, { poll, row });
            default:
                return this.pollService.getVoteValueInPercent(value, { poll, row });
        }
    }
}
