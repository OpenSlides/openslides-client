import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatRadioModule } from '@angular/material/radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatSliderModule } from '@angular/material/slider';
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
