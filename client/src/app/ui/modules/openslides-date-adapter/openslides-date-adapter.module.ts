import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';

import { OpenSlidesDateAdapter } from './openslides-date-adapter';

const EXPORTS = [MatDatepickerModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, MatMomentDateModule, ...EXPORTS],
    exports: EXPORTS,
    providers: [
        {
            provide: DateAdapter,
            useClass: OpenSlidesDateAdapter,
            deps: [TranslateService, MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        } // see remarks in OpenSlidesDateAdapter
    ]
})
export class OpenSlidesDateAdapterModule {}
