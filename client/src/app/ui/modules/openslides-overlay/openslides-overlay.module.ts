import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomOverlayModule } from './modules/custom-overlay';
import { SpinnerModule } from './modules/spinner';

@NgModule({
    declarations: [],
    exports: [SpinnerModule, CustomOverlayModule],
    imports: [CommonModule]
})
export class OpenSlidesOverlayModule {}
