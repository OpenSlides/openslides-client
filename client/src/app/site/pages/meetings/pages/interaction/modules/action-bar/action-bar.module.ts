import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { PipesModule } from 'src/app/ui/pipes';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

const EXPORTS = [ActionBarComponent];

@NgModule({
    exports: EXPORTS,
    declarations: EXPORTS,
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule,
        MatBadgeModule,
        RouterModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ActionBarModule {}
