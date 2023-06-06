import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { langToTimeLocale } from 'src/app/infrastructure/utils';

/**
 * A custom DateAdapter for the datetimepicker in the config. Uses MomentDateAdapter for localisation.
 * Is needed to subscribe to language changes
 */
@Injectable()
export class OpenSlidesDateAdapter extends DateFnsAdapter {
    public constructor(protected translate: TranslateService, @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale);
        // subscribe to language changes to change localisation of dates accordingly
        // DateAdapter seems not to be a singleton so we do that in this subclass instead of app.component
        this.updateLocaleByName(translate.currentLang);
        translate.onLangChange.subscribe((e: LangChangeEvent) => {
            this.updateLocaleByName(translate.currentLang);
        });
    }

    private async updateLocaleByName(name: string): Promise<void> {
        this.setLocale(await langToTimeLocale(name));
    }
}
