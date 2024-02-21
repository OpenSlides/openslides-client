import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDateFnsModule } from '@angular/material-date-fns-adapter';
import { TranslateService } from '@ngx-translate/core';
import { enUS } from 'date-fns/locale';

import { OpenSlidesDateAdapter } from './openslides-date-adapter';

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
        } // see remarks in OpenSlidesDateAdapter
    ]
})
export class OpenSlidesDateAdapterModule {}
