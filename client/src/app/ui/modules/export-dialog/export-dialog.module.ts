import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { DirectivesModule } from '../../directives';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';

@NgModule({
    declarations: [ExportDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatDialogModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ExportDialogModule {
    public static getComponent(): typeof ExportDialogComponent {
        return ExportDialogComponent;
    }
}
