import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionBlockEditDialogComponent } from './components/motion-block-edit-dialog/motion-block-edit-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';

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
