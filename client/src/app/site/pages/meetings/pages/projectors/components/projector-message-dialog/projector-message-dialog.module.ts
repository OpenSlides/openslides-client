import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';

import { ProjectorMessageDialogComponent } from './components/projector-message-dialog/projector-message-dialog.component';

@NgModule({
    declarations: [ProjectorMessageDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        LegacyEditorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorMessageDialogModule {
    public static getComponent(): typeof ProjectorMessageDialogComponent {
        return ProjectorMessageDialogComponent;
    }
}
