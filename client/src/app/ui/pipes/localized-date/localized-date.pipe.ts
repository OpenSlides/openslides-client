import { Pipe, PipeTransform } from '@angular/core';
import { fromUnixTime } from 'date-fns';
import { FormatPipe } from 'ngx-date-fns';

@Pipe({
    name: `localizedDate`,
    pure: false
})
export class LocalizedDatePipe extends FormatPipe implements PipeTransform {
    public override transform(value: any, dateFormat: string = `PPp`): any {
        if (!value) {
            return ``;
        }

        const date = fromUnixTime(value);
        return super.transform(date, dateFormat);
    }
}
