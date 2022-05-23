import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesOverlayModule } from 'src/app/ui/modules/openslides-overlay';
import { SpinnerModule } from 'src/app/ui/modules/spinner';

@NgModule({
    declarations: [],
    imports: [CommonModule, SpinnerModule, OpenSlidesOverlayModule]
})
export class GlobalSpinnerModule {}
