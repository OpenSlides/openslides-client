import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectorMessageDialogComponent } from './components/projector-message-dialog/projector-message-dialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatButtonModule } from '@angular/material/button';

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
