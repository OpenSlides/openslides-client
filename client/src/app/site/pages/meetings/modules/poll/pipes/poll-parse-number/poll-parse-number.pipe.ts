import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VOTE_MAJORITY, VOTE_UNDOCUMENTED } from 'src/app/domain/models/poll/poll-constants';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Pipe({
    name: 'pollParseNumber'
})
export class PollParseNumberPipe implements PipeTransform {
    private formatter = new Intl.NumberFormat(`us-us`, {
        style: `decimal`,
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
    });

    public transform(value?: number): string {
        switch (value) {
            case VOTE_MAJORITY:
                return _(`majority`);
            case undefined:
            case null:
                return this.formatter.format(0);
            case VOTE_UNDOCUMENTED:
                return _(`undocumented`);
            default:
                return this.formatter.format(value);
        }
    }
}
