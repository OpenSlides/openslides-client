import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
