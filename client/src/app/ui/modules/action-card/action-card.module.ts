import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { ExpandableContentWrapperModule } from '../expandable-content-wrapper';
import { ActionCardComponent } from './components/action-card/action-card.component';

const DECLARATIONS = [ActionCardComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatCardModule,
        DirectivesModule,
        ExpandableContentWrapperModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ActionCardModule {}
