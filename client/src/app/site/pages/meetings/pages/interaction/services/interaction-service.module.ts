import { NgModule } from '@angular/core';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay';
import { PromptDialogComponent } from 'src/app/ui/modules/prompt-dialog';

@NgModule({
    imports: [PromptDialogComponent, OpenSlidesOverlayModule]
})
export class InteractionServiceModule {}
