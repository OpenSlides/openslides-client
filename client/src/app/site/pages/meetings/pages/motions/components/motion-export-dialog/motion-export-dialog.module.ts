import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionExportDialogComponent } from './components/motion-export-dialog/motion-export-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { DirectivesModule } from 'src/app/ui/directives';

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
