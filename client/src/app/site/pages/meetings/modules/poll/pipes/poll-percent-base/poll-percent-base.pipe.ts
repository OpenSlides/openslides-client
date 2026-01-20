import { Pipe, PipeTransform } from '@angular/core';
import { OptionData, PollData } from 'src/app/domain/models/poll/generic-poll';
import { PollTableData } from 'src/app/domain/models/poll/poll-constants';

import { PollService } from '../../services/poll.service/poll.service';
import { PollServiceMapperService } from '../../services/poll-service-mapper.service/poll-service-mapper.service';

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
        private pollServiceMapperService: PollServiceMapperService
    ) {}

    public transform(value: number, poll: PollData, row?: OptionData | PollTableData): string | null {
        // logic handles over the pollService to avoid circular dependencies
        const voteValueInPercent: string = this.getVoteValueInPercent(value, poll, row);

        if (voteValueInPercent) {
            return `(${voteValueInPercent})`;
        } else {
            return null;
        }
    }

    protected getVoteValueInPercent(value: number, poll: PollData, row?: OptionData | PollTableData): string {
        const service = this.pollServiceMapperService.getService(poll.pollClassType);
        if (service) {
            return service.getVoteValueInPercent(value, { poll, row });
        }
        return this.pollService.getVoteValueInPercent(value, { poll, row });
    }
}

@Pipe({
    name: `pollPercentBaseAlt`
})
export class PollPercentBaseAltPipe extends PollPercentBasePipe implements PipeTransform {
    public override transform(value: number, poll: PollData, row?: OptionData | PollTableData): string | null {
        // logic handles over the pollService to avoid circular dependencies
        const voteValueInPercent: string = this.getVoteValueInPercent(value, poll, row);

        if (voteValueInPercent) {
            // 'Alt' because it displays the percent without parathesis
            return `${voteValueInPercent}`;
        } else {
            return null;
        }
    }
}
