import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionBlockCreateDialogComponent } from './components/motion-block-create-dialog/motion-block-create-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { AgendaContentObjectFormModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/agenda-content-object-form/agenda-content-object-form.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [MotionBlockCreateDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        ReactiveFormsModule,
        AgendaContentObjectFormModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionBlockCreateDialogModule {
    public static getComponent(): typeof MotionBlockCreateDialogComponent {
        return MotionBlockCreateDialogComponent;
    }
}
