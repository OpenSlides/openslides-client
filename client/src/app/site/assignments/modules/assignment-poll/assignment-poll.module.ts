import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PollsModule } from 'app/site/polls/polls.module';

import { AssignmentPollRoutingModule } from './assignment-poll-routing.module';
import { AssignmentPollComponent } from './components/assignment-poll/assignment-poll.component';
import { AssignmentPollDetailComponent } from './components/assignment-poll-detail/assignment-poll-detail.component';
import { AssignmentPollDialogComponent } from './components/assignment-poll-dialog/assignment-poll-dialog.component';
import { AssignmentPollMetaInfoComponent } from './components/assignment-poll-meta-info/assignment-poll-meta-info.component';
import { AssignmentPollVoteComponent } from './components/assignment-poll-vote/assignment-poll-vote.component';

@NgModule({
    declarations: [
        AssignmentPollComponent,
        AssignmentPollDetailComponent,
        AssignmentPollVoteComponent,
        AssignmentPollDialogComponent,
        AssignmentPollMetaInfoComponent
    ],
    exports: [AssignmentPollComponent, AssignmentPollVoteComponent],
    imports: [CommonModule, AssignmentPollRoutingModule, SharedModule, PollsModule]
})
export class AssignmentPollModule {}
