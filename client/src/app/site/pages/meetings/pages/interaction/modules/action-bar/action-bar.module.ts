import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes';

import { ActionBarComponent } from './components/action-bar/action-bar.component';

const EXPORTS = [ActionBarComponent];

@NgModule({
    exports: EXPORTS,
    declarations: EXPORTS,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
        RouterModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ActionBarModule {}
