import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { ActionCardComponent } from './components/action-card/action-card.component';

const DECLARATIONS = [ActionCardComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatCardModule, DirectivesModule, OpenSlidesTranslationModule.forChild()]
})
export class ActionCardModule {}
