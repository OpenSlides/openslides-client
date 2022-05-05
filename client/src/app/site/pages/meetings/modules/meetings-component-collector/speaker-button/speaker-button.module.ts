import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakerButtonComponent } from './components/speaker-button/speaker-button.component';
import { MatIconModule } from '@angular/material/icon';
import { DetailViewModule } from '../detail-view/detail-view.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatBadgeModule } from '@angular/material/badge';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

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
