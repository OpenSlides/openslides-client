import { NgModule } from '@angular/core';
import { OverlayComponent } from 'src/app/ui/modules/openslides-overlay';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

@NgModule({
    imports: [PromptDialogModule, OverlayComponent]
})
export class InteractionServiceModule {}
