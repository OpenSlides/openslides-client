import { Pipe, PipeTransform } from '@angular/core';
import { unix } from 'moment';

@Pipe({
    name: `localizedDate`,
    pure: false
})
export class LocalizedDatePipe implements PipeTransform {
    public constructor() {}

    public transform(value: any, dateFormat: string = `lll`): any {
        if (!value) {
            return ``;
        }

        const dateLocale = unix(value).local();
        return dateLocale.format(dateFormat);
    }
}
