import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

import { CountdownTimeModule } from '../../../../modules/projector/modules/countdown-time/countdown-time.module';
import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantSpeakerListComponent } from './components/participant-speaker-list/participant-speaker-list.component';
import { ParticipantSpeakerListRoutingModule } from './participant-speaker-list-routing.module';
import { ParticipantSpeakerListServiceModule } from './services/participant-speaker-list-service.module';

@NgModule({
    declarations: [ParticipantSpeakerListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        ParticipantSpeakerListRoutingModule,
        ParticipantSpeakerListServiceModule,
        ParticipantExportModule,
        UserComponentsModule,
        ChoiceDialogModule,
        HeadBarModule,
        IconContainerModule,
        CountdownTimeModule,
        DirectivesModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MatCheckboxModule,
        MatDividerModule,
        MatTooltipModule,
        PipesModule
    ]
})
export class ParticipantSpeakerListModule {}
