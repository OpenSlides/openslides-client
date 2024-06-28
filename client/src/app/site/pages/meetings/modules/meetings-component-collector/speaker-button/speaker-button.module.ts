import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { DetailViewModule } from '../detail-view/detail-view.module';
import { SpeakerButtonComponent } from './components/speaker-button/speaker-button.component';

const DECLARATIONS = [SpeakerButtonComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
        MatBadgeModule,
        MatMenuModule,
        DetailViewModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SpeakerButtonModule {}
