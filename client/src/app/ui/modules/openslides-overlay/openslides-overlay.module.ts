import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerModule } from './modules/spinner';
import { CustomOverlayModule } from './modules/custom-overlay';

@NgModule({
    declarations: [],
    exports: [SpinnerModule, CustomOverlayModule],
    imports: [CommonModule]
})
export class OpenSlidesOverlayModule {}
