import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeBuilderDialogComponent } from './components/theme-builder-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ColorFormFieldModule } from 'src/app/ui/modules/color-form-field/color-form-field.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

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
