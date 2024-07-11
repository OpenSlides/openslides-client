import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';

@NgModule({
    declarations: [PromptDialogComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule, OpenSlidesTranslationModule.forChild()]
})
export class PromptDialogModule {}
