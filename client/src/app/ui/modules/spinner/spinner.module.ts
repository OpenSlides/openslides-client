import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { SpinnerComponent } from './components/spinner/spinner.component';

const DECLARATIONS = [SpinnerComponent];

@NgModule({
    exports: [...DECLARATIONS],
    declarations: DECLARATIONS,
    imports: [CommonModule, OpenSlidesTranslationModule.forChild()]
})
export class SpinnerModule {}
