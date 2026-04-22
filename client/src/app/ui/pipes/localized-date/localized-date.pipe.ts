import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { TZDate, tzName } from '@date-fns/tz';
import { DateFnsConfigurationService, FormatPipe } from 'ngx-date-fns';
import { TimeZoneService } from 'src/app/site/services/time-zone.service';

@Pipe({
    name: `localizedDate`,
    pure: false,
    standalone: false
})
export class LocalizedDatePipe implements PipeTransform {
    private formatter = new FormatPipe(this.inputDate, this.cd);

    public constructor(
        private inputDate: DateFnsConfigurationService,
        private cd: ChangeDetectorRef,
        private timeZone: TimeZoneService
    ) {}

    public transform(value: any, dateFormat = `PPp`): any {
        if (!value && value !== 0) {
            return ``;
        }

        const timezone = this.timeZone.getActiveMeetingTZ();
        const date = new TZDate(value * 1000, timezone);
        const result = this.formatter.transform(date, dateFormat);
        if (timezone !== new Intl.DateTimeFormat().resolvedOptions().timeZone) {
            return result + ` ${tzName(timezone, date, 'short')}`;
        }
        return result;
    }
}
