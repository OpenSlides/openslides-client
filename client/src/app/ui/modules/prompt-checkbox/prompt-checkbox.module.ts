import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { PromptDialogModule } from '../prompt-dialog';
import { PromptCheckboxComponent } from './components/prompt-checkbox/prompt-checkbox.component';

@NgModule({
    declarations: [PromptCheckboxComponent],
    imports: [CommonModule, OpenSlidesTranslationModule.forChild(), MatCheckboxModule, PromptDialogModule],
    exports: [PromptCheckboxComponent]
})
export class PromptCheckboxModule {}
