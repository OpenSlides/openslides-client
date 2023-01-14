import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from 'src/app/ui/directives';

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
        DirectivesModule
    ]
})
export class CommitteeComponentsModule {}
