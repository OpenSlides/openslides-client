import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommitteeMetaInfoComponent } from './committee-meta-info/committee-meta-info.component';
import { CommitteeMeetingPreviewComponent } from './committee-meeting-preview/committee-meeting-preview.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '../../../../../modules/translations';
import { MeetingTimeModule } from '../../../../../../ui/modules/meeting-time/meeting-time.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';
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
