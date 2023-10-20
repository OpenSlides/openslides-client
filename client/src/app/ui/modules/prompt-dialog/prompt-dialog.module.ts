import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';

@NgModule({
    declarations: [PromptDialogComponent],
    imports: [CommonModule, MatDialogModule, MatButtonModule, OpenSlidesTranslationModule.forChild()]
})
export class PromptDialogModule {}
