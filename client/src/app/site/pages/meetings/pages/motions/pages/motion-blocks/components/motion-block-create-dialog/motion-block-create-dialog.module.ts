import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { AgendaContentObjectFormModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/agenda-content-object-form/agenda-content-object-form.module';

import { MotionBlockCreateDialogComponent } from './components/motion-block-create-dialog/motion-block-create-dialog.component';

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
