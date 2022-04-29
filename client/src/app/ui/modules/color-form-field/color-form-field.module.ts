import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorFormFieldComponent } from './components/color-form-field/color-form-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
