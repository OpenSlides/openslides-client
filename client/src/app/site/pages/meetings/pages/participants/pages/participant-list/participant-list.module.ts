import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantListComponent } from './components/participant-list/participant-list.component';
import { ParticipantMultiselectActionsComponent } from './components/participant-multiselect-actions/participant-multiselect-actions.component';
import { ParticipantListInfoDialogModule } from './modules/participant-list-info-dialog/participant-list-info-dialog.module';
import { ParticipantListRoutingModule } from './participant-list-routing.module';
import { ParticipantListServiceModule } from './services/participant-list-service.module';

@NgModule({
    declarations: [ParticipantListComponent, ParticipantMultiselectActionsComponent],
    imports: [
        CommonModule,
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
        MatDividerModule,
        MatTooltipModule,
        PipesModule
    ]
})
export class ParticipantListModule {}
