import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { MotionBlockEditDialogComponent } from './components/motion-block-edit-dialog/motion-block-edit-dialog.component';

@NgModule({
    declarations: [MotionBlockEditDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionBlockEditDialogModule {
    public static getComponent(): typeof MotionBlockEditDialogComponent {
        return MotionBlockEditDialogComponent;
    }
}
