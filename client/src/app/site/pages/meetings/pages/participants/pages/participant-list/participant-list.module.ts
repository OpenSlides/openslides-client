import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantListRoutingModule } from './participant-list-routing.module';
import { ParticipantListComponent } from './components/participant-list/participant-list.component';
import { ParticipantListServiceModule } from './services/participant-list-service.module';
import { ParticipantExportModule } from '../../export/participant-export.module';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { ParticipantListInfoDialogModule } from './modules/participant-list-info-dialog/participant-list-info-dialog.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParticipantMultiselectActionsComponent } from './components/participant-multiselect-actions/participant-multiselect-actions.component';
import { DirectivesModule } from 'src/app/ui/directives';

@NgModule({
    declarations: [ParticipantListComponent, ParticipantMultiselectActionsComponent],
    imports: [
        CommonModule,
        ParticipantListRoutingModule,
        ParticipantListServiceModule,
        ParticipantListInfoDialogModule,
        ParticipantExportModule,
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
        MatTooltipModule
    ]
})
export class ParticipantListModule {}
