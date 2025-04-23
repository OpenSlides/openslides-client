import { Pipe, PipeTransform } from '@angular/core';

import { PollService } from '../../services/poll.service';

@Pipe({
    name: `pollParseNumber`
})
export class PollParseNumberPipe implements PipeTransform {
    public constructor(private pollService: PollService) {}

    public transform(value?: number): string {
        return this.pollService.parseNumber(value);
    }
}
