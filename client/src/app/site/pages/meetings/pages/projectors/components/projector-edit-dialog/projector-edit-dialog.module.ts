import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ProjectorComponent } from '../../../../modules/projector/components/projector/projector.component';
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
        ProjectorComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorEditDialogModule {
    public static getComponent(): typeof ProjectorEditDialogComponent {
        return ProjectorEditDialogComponent;
    }
}
