import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { CustomOverlayModule } from '../custom-overlay/custom-overlay.module';
import { SpinnerComponent } from './components/spinner/spinner.component';

const DECLARATIONS = [SpinnerComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule, CustomOverlayModule, OpenSlidesTranslationModule.forChild()]
})
export class SpinnerModule {}
