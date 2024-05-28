import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { EditorModule } from 'src/app/ui/modules/editor';

import { ProjectorMessageDialogComponent } from './components/projector-message-dialog/projector-message-dialog.component';

@NgModule({
    declarations: [ProjectorMessageDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorMessageDialogModule {
    public static getComponent(): typeof ProjectorMessageDialogComponent {
        return ProjectorMessageDialogComponent;
    }
}
