import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ColorFormFieldComponent } from './components/color-form-field/color-form-field.component';

const DECLARATIONS = [ColorFormFieldComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        OpenSlidesTranslationModule,
        MatTooltipModule,
        FormsModule
    ]
})
export class ColorFormFieldModule {}
