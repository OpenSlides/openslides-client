import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CustomOverlayModule } from '../custom-overlay/custom-overlay.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

const DECLARATIONS = [SpinnerComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule, CustomOverlayModule, OpenSlidesTranslationModule.forChild()]
})
export class SpinnerModule {}
