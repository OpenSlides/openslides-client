import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VOTE_MAJORITY, VOTE_UNDOCUMENTED } from 'src/app/domain/models/poll/poll-constants';

@Pipe({
    name: `pollParseNumber`,
    standalone: false
})
@Injectable({
    providedIn: `root`
})
export class PollParseNumberPipe implements PipeTransform {
    private formatter = new Intl.NumberFormat(`us-us`, {
        style: `decimal`,
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
    });

    public constructor(private translate: TranslateService) {}

    public transform(value?: number): string {
        switch (value) {
            case VOTE_MAJORITY:
                return this.translate.instant(`majority`);
            case undefined:
            case null:
                return this.formatter.format(0);
            case VOTE_UNDOCUMENTED:
                return this.translate.instant(`undocumented`);
            default:
                return this.formatter.format(value);
        }
    }
}
