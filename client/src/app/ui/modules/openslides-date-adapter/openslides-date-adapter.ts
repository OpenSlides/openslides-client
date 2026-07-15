import { inject, Injectable } from '@angular/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { langToTimeLocale } from '@app/infrastructure/utils';
import { TranslateService } from '@ngx-translate/core';

/**
 * A custom DateAdapter for the datetimepicker in the config. Uses MomentDateAdapter for localisation.
 * Is needed to subscribe to language changes
 */
@Injectable()
export class OpenSlidesDateAdapter extends DateFnsAdapter {
    private translate = inject(TranslateService);

    public constructor() {
        super();
        // subscribe to language changes to change localisation of dates accordingly
        // DateAdapter seems not to be a singleton so we do that in this subclass instead of app.component
        this.updateLocaleByName(this.translate.getCurrentLang());
        this.translate.onLangChange.subscribe(() => {
            this.updateLocaleByName(this.translate.getCurrentLang());
        });
    }

    private async updateLocaleByName(name: string): Promise<void> {
        this.setLocale(await langToTimeLocale(name));
    }
}
