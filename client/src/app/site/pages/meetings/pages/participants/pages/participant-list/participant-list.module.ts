import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
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

import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantListComponent } from './components/participant-list/participant-list.component';
import { ParticipantSwitchDialogComponent } from './components/participant-switch-dialog/participant-switch-dialog.component';
import { ParticipantListInfoDialogModule } from './modules/participant-list-info-dialog/participant-list-info-dialog.module';
import { ParticipantListRoutingModule } from './participant-list-routing.module';
import { ParticipantListServiceModule } from './services/participant-list-service.module';

@NgModule({
    declarations: [ParticipantListComponent, ParticipantSwitchDialogComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        ParticipantListRoutingModule,
        ParticipantListServiceModule,
        ParticipantListInfoDialogModule,
        ParticipantExportModule,
        UserComponentsModule,
        ChoiceDialogModule,
        HeadBarModule,
        IconContainerModule,
        DirectivesModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatTooltipModule,
        PipesModule
    ]
})
export class ParticipantListModule {}
