import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PollService } from '../../services/poll.service';

@Pipe({
    name: `pollParseNumber`,
    pure: false
})
export class PollParseNumberPipe implements PipeTransform {
    protected translate = inject(TranslateService);
    private pollService = inject(PollService);

    public transform(value?: number): string {
        return this.pollService.parseNumber(value, 3);
    }
}
