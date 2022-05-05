import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AssignmentPollModule } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { SlideToken } from '../../definitions';
import { PollSlideComponent } from './components/poll-slide.component';

@NgModule({
    imports: [CommonModule, MotionPollModule, AssignmentPollModule],
    declarations: [PollSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: PollSlideComponent }]
})
export class PollSlideModule {}
