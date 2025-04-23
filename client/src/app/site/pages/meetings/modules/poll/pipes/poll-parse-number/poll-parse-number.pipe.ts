import { Pipe, PipeTransform } from '@angular/core';

import { MotionPollService } from '../../../../pages/motions/modules/motion-poll/services';

@Pipe({
    name: `pollParseNumber`
})
export class PollParseNumberPipe implements PipeTransform {
    public constructor(private motionPollService: MotionPollService) {}

    public transform(value?: number): string {
        return this.motionPollService.parseNumber(value);
    }
}
