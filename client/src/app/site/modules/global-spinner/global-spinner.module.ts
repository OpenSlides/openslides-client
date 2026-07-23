import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OverlayComponent } from '@app/ui/modules/openslides-overlay';
import { SpinnerModule } from '@app/ui/modules/spinner';

import { OpenSlidesTranslationModule } from '../translations';
import { GlobalSpinnerComponent } from './components/global-spinner/global-spinner.component';

@NgModule({
    declarations: [GlobalSpinnerComponent],
    imports: [CommonModule, SpinnerModule, OpenSlidesTranslationModule.forChild(), OverlayComponent]
})
export class GlobalSpinnerModule {}
