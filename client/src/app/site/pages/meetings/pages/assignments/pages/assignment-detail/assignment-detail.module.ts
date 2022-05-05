import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentDetailRoutingModule } from './assignment-detail-routing.module';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { EditorModule } from 'src/app/ui/modules/editor';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingsComponentCollectorModule } from '../../../../modules/meetings-component-collector/meetings-component-collector.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules/sorting-list/sorting-list.module';
import { MatInputModule } from '@angular/material/input';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { AssignmentPollModule } from '../../modules/assignment-poll/assignment-poll.module';
import { AssignmentDetailServiceModule } from './services/assignment-detail-service.module';
import { AssignmentCommonServiceModule } from '../../services/assignment-common-service.module';
import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { AssignmentExportServiceModule } from '../../services/assignment-export-service.module';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';

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
        EditorModule,
        SearchSelectorModule,
        SortingListModule,
        OpenSlidesTranslationModule.forChild(),
        AgendaItemCommonServiceModule
    ]
})
export class AssignmentDetailModule {}
