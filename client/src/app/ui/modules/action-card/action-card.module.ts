import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCardComponent } from './components/action-card/action-card.component';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

const DECLARATIONS = [ActionCardComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatCardModule, DirectivesModule, OpenSlidesTranslationModule.forChild()]
})
export class ActionCardModule {}
