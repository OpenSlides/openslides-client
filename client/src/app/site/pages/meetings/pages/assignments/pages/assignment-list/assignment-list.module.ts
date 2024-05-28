import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { AssignmentCommonServiceModule } from '../../services/assignment-common-service.module';
import { AssignmentExportServiceModule } from '../../services/assignment-export-service.module';
import { AssignmentListRoutingModule } from './assignment-list-routing.module';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';
import { AssignmentListServiceModule } from './services/assignment-list-service.module';

@NgModule({
    declarations: [AssignmentListComponent],
    imports: [
        CommonModule,
        AssignmentListRoutingModule,
        AssignmentListServiceModule,
        AssignmentCommonServiceModule,
        AssignmentExportServiceModule,
        OpenSlidesTranslationModule.forChild(),
        MeetingsComponentCollectorModule,
        HeadBarModule,
        DirectivesModule,
        MatMenuModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        MatDividerModule
    ]
})
export class AssignmentListModule {}
