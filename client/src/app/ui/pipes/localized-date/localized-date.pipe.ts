import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { locale, unix } from 'moment';

@Pipe({
    name: `localizedDate`
})
export class LocalizedDatePipe implements PipeTransform {
    public constructor(private translate: TranslateService) {}

    public transform(value: any, dateFormat: string = `lll`): any {
        const lang = this.translate.currentLang ? this.translate.currentLang : this.translate.defaultLang;
        if (!value) {
            return ``;
        }
        locale(lang);
        const dateLocale = unix(value).local();
        return dateLocale.format(dateFormat);
    }
}
