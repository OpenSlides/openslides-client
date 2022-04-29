import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [PromptDialogComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule, OpenSlidesTranslationModule.forChild()]
})
export class PromptDialogModule {}
