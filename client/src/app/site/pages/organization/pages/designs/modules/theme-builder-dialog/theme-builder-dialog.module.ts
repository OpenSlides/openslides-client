import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ColorFormFieldComponent } from 'src/app/ui/modules/color-form-field';

import { ThemeBuilderDialogComponent } from './components/theme-builder-dialog.component';

@NgModule({
    declarations: [ThemeBuilderDialogComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatInputModule,
        ColorFormFieldComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ThemeBuilderDialogModule {
    public static getComponent(): typeof ThemeBuilderDialogComponent {
        return ThemeBuilderDialogComponent;
    }
}
