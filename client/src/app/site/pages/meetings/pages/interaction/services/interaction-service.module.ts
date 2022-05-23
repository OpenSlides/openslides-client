import { NgModule } from '@angular/core';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

@NgModule({
    imports: [PromptDialogModule, OpenSlidesOverlayModule]
})
export class InteractionServiceModule {}
