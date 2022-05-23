import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OverlayComponent } from './components/overlay/overlay.component';

const EXPORTED_COMPONENTS = [OverlayComponent];

@NgModule({
    declarations: EXPORTED_COMPONENTS,
    exports: [...EXPORTED_COMPONENTS],
    imports: [CommonModule]
})
export class OpenSlidesOverlayModule {}
