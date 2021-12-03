import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PollsModule } from 'app/site/polls/polls.module';

import { MotionPollComponent } from './motion-poll/motion-poll.component';
import { MotionPollDetailComponent } from './motion-poll-detail/motion-poll-detail.component';
import { MotionPollMetaInformationComponent } from './motion-poll-meta-information/motion-poll-meta-information.component';
import { MotionPollRoutingModule } from './motion-poll-routing.module';
import { MotionPollVoteComponent } from './motion-poll-vote/motion-poll-vote.component';

@NgModule({
    imports: [CommonModule, SharedModule, MotionPollRoutingModule, PollsModule],
    exports: [MotionPollComponent, MotionPollVoteComponent],
    declarations: [
        MotionPollComponent,
        MotionPollDetailComponent,
        MotionPollVoteComponent,
        MotionPollMetaInformationComponent
    ]
})
export class MotionPollModule {}
