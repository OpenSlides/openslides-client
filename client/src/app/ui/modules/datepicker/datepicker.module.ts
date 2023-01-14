import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { DatepickerComponent } from './components/datepicker/datepicker.component';

@NgModule({
    declarations: [DatepickerComponent],
    imports: [
        CommonModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [DatepickerComponent]
})
export class DatepickerModule {}
