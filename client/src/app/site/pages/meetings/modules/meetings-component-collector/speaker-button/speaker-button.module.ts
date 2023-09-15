import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
