import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChipSelectModule } from 'src/app/site/modules/chip-select/chip-select.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ChessDialogModule } from 'src/app/ui/modules/sidenav/modules/easter-egg/modules/chess-dialog';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules/sorting-list/sorting-list.module';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { MeetingsComponentCollectorModule } from '../../../../modules/meetings-component-collector/meetings-component-collector.module';
import { ParticipantSearchSelectorModule } from '../../../../modules/participant-search-selector';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { AssignmentPollModule } from '../../modules/assignment-poll/assignment-poll.module';
import { AssignmentCommonServiceModule } from '../../services/assignment-common-service.module';
import { AssignmentExportServiceModule } from '../../services/assignment-export-service.module';
import { AssignmentDetailRoutingModule } from './assignment-detail-routing.module';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentDetailServiceModule } from './services/assignment-detail-service.module';

@NgModule({
    declarations: [AssignmentDetailComponent],
    imports: [
        CommonModule,
        AssignmentDetailRoutingModule,
        AssignmentDetailServiceModule,
        AssignmentCommonServiceModule,
        AssignmentExportServiceModule,
        AssignmentPollModule,
        ParticipantCommonServiceModule,
        ReactiveFormsModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatMenuModule,
        MatInputModule,
        MatCheckboxModule,
        MeetingsComponentCollectorModule,
        AttachmentControlModule,
        PipesModule,
        DirectivesModule,
        HeadBarModule,
        LegacyEditorModule,
        SearchSelectorModule,
        SortingListModule,
        OpenSlidesTranslationModule.forChild(),
        ParticipantSearchSelectorModule,
        AgendaItemCommonServiceModule,
        ChipSelectModule,
        ChessDialogModule
    ]
})
export class AssignmentDetailModule {}
