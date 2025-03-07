import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TopicPollModule } from 'src/app/site/pages/meetings/pages/agenda/modules/topics/modules/topic-poll/topic-poll.module';
import { AssignmentPollModule } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';

import { SlideToken } from '../../definitions';
import { PollSlideComponent } from './components/poll-slide.component';

@NgModule({
    exports: [PollSlideComponent],
    imports: [CommonModule, MotionPollModule, AssignmentPollModule, TopicPollModule],
    declarations: [PollSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: PollSlideComponent }]
})
export class PollSlideModule {}
