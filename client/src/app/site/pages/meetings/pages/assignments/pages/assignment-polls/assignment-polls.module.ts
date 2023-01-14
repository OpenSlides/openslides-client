import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

import { AssignmentPollModule } from '../../modules/assignment-poll/assignment-poll.module';
import { AssignmentPollsRoutingModule } from './assignment-polls-routing.module';
import { AssignmentPollDetailComponent } from './components/assignment-poll-detail/assignment-poll-detail.component';
import { AssignmentPollMainComponent } from './components/assignment-poll-main/assignment-poll-main.component';

@NgModule({
    declarations: [AssignmentPollDetailComponent, AssignmentPollMainComponent],
    imports: [
        CommonModule,
        AssignmentPollsRoutingModule,
        AssignmentPollModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatDividerModule,
        DirectivesModule,
        ListModule,
        HeadBarModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AssignmentPollsModule {}
