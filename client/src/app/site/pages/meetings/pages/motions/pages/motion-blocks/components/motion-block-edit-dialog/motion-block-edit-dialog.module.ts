import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { MotionBlockEditDialogComponent } from './components/motion-block-edit-dialog/motion-block-edit-dialog.component';

@NgModule({
    declarations: [MotionBlockEditDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
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
