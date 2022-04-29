import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentPollsRoutingModule } from './assignment-polls-routing.module';
import { AssignmentPollDetailComponent } from './components/assignment-poll-detail/assignment-poll-detail.component';
import { MatCardModule } from '@angular/material/card';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ListModule } from 'src/app/ui/modules/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { AssignmentPollModule } from '../../modules/assignment-poll/assignment-poll.module';
import { AssignmentPollMainComponent } from './components/assignment-poll-main/assignment-poll-main.component';
import { RouterModule } from '@angular/router';

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
