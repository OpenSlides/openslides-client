import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ProjectorCountdownDialogComponent } from './components/projector-countdown-dialog/projector-countdown-dialog.component';

@NgModule({
    declarations: [ProjectorCountdownDialogComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorCountdownDialogModule {
    public static getComponent(): typeof ProjectorCountdownDialogComponent {
        return ProjectorCountdownDialogComponent;
    }
}
