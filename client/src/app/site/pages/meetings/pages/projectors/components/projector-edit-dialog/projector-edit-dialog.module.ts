import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { ProjectorEditDialogComponent } from './components/projector-edit-dialog/projector-edit-dialog.component';

@NgModule({
    declarations: [ProjectorEditDialogComponent],
    imports: [
        CommonModule,
        MatSliderModule,
        MatRadioModule,
        MatFormFieldModule,
        MatDividerModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        ReactiveFormsModule,
        ProjectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorEditDialogModule {
    public static getComponent(): typeof ProjectorEditDialogComponent {
        return ProjectorEditDialogComponent;
    }
}
