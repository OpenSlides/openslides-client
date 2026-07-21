import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { UserComponentsModule } from '@app/site/modules/user-components';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { ChoiceDialogComponent } from '@app/ui/modules/choice-dialog';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { PipesModule } from '@app/ui/pipes';

import { CountdownTimeModule } from '../../../../modules/projector/modules/countdown-time/countdown-time.module';
import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantSpeakerListComponent } from './components/participant-speaker-list/participant-speaker-list.component';
import { ParticipantSpeakerListRoutingModule } from './participant-speaker-list-routing.module';
import { ParticipantSpeakerListServiceModule } from './services/participant-speaker-list-service.module';

@NgModule({
    declarations: [ParticipantSpeakerListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
        ParticipantSpeakerListRoutingModule,
        ParticipantSpeakerListServiceModule,
        ParticipantExportModule,
        UserComponentsModule,
        ChoiceDialogComponent,
        HeadBarModule,
        IconContainerComponent,
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
