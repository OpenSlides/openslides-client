import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipModule } from 'src/app/ui/modules/chip';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';

import { MeetingTimeModule } from '../../../../../../ui/modules/meeting-time/meeting-time.module';
import { OpenSlidesTranslationModule } from '../../../../../modules/translations';
import { CommitteeMeetingPreviewComponent } from './committee-meeting-preview/committee-meeting-preview.component';
import { CommitteeMetaInfoComponent } from './committee-meta-info/committee-meta-info.component';
import { CommitteeComponentsServiceModule } from './services/committee-components-service.module';

const DECLARATIONS = [CommitteeMetaInfoComponent, CommitteeMeetingPreviewComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        CommitteeComponentsServiceModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        RouterModule,
        OpenSlidesTranslationModule.forChild(),
        MeetingTimeModule,
        DirectivesModule,
        ChipModule,
        IconContainerModule
    ]
})
export class CommitteeComponentsModule {}
