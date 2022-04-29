import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { OpenSlidesDateAdapter } from './openslides-date-adapter';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

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
