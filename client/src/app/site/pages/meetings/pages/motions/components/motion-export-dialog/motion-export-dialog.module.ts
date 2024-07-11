import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionExportDialogComponent } from './components/motion-export-dialog/motion-export-dialog.component';

@NgModule({
    declarations: [MotionExportDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatDialogModule,
        MotionsExportModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionExportDialogModule {
    public static getComponent(): typeof MotionExportDialogComponent {
        return MotionExportDialogComponent;
    }
}
