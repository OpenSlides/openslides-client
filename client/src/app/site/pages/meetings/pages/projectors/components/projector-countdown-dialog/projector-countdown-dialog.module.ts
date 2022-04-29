import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectorCountdownDialogComponent } from './components/projector-countdown-dialog/projector-countdown-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
