import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ColorFormFieldModule } from 'src/app/ui/modules/color-form-field/color-form-field.module';

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
        ColorFormFieldModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ThemeBuilderDialogModule {
    public static getComponent(): typeof ThemeBuilderDialogComponent {
        return ThemeBuilderDialogComponent;
    }
}
