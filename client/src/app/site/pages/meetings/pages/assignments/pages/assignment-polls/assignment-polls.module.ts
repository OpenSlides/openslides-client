import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ListModule } from '@app/ui/modules/list';

import { AssignmentPollModule } from '../../modules/assignment-poll/assignment-poll.module';
import { AssignmentPollServiceModule } from '../../modules/assignment-poll/services/assignment-poll-service.module';
import { AssignmentPollsRoutingModule } from './assignment-polls-routing.module';
import { AssignmentPollDetailComponent } from './components/assignment-poll-detail/assignment-poll-detail.component';
import { AssignmentPollMainComponent } from './components/assignment-poll-main/assignment-poll-main.component';

@NgModule({
    declarations: [AssignmentPollDetailComponent, AssignmentPollMainComponent],
    imports: [
        CommonModule,
        AssignmentPollsRoutingModule,
        AssignmentPollModule,
        AssignmentPollServiceModule,
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
