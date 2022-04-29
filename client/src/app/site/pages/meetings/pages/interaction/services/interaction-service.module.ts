import { NgModule } from '@angular/core';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay/openslides-overlay.module';

@NgModule({
    imports: [PromptDialogModule, OpenSlidesOverlayModule]
})
export class InteractionServiceModule {}
