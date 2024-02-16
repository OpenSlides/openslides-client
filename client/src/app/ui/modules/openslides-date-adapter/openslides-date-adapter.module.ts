import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDateFnsModule } from '@angular/material-date-fns-adapter';
import { NGX_MAT_DATE_FORMATS, NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { TranslateService } from '@ngx-translate/core';
import { enUS } from 'date-fns/locale';

import { OpenSlidesDateAdapter } from './openslides-date-adapter';

export const NGX_MAT_DATEFNS_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: `P`
    },
    display: {
        dateInput: `P`,
        monthYearLabel: `MMM yyyy`,
        dateA11yLabel: `PP`,
        monthYearA11yLabel: `MMMM yyyy`
    }
};

const EXPORTS = [MatDatepickerModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, MatDateFnsModule, ...EXPORTS],
    exports: EXPORTS,
    providers: [
        {
            provide: MAT_DATE_LOCALE,
            useValue: enUS
        },
        {
            provide: DateAdapter,
            useClass: OpenSlidesDateAdapter,
            deps: [TranslateService, MAT_DATE_LOCALE]
        }, // see remarks in OpenSlidesDateAdapter
        {
            provide: NgxMatDateAdapter,
            useClass: OpenSlidesDateAdapter,
            deps: [TranslateService, MAT_DATE_LOCALE]
        }, // see remarks in OpenSlidesDateAdapter
        { provide: NGX_MAT_DATE_FORMATS, useValue: NGX_MAT_DATEFNS_DATE_FORMATS }
    ]
})
export class OpenSlidesDateAdapterModule {}
