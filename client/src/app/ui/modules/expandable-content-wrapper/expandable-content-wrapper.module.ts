import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { DirectivesModule } from '../../directives';
import { ExpandableContentWrapperComponent } from './components/expandable-content-wrapper/expandable-content-wrapper.component';

const DECLARATIONS = [ExpandableContentWrapperComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, DirectivesModule, OpenSlidesTranslationModule.forChild()]
})
export class ExpandableContentWrapperModule {}
