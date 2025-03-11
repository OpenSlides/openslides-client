import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { TopicPollModule } from 'src/app/site/pages/meetings/pages/agenda/modules/topics/modules/topic-poll/topic-poll.module';
import { AssignmentPollModule } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { SlideToken } from '../../definitions';
import { PollSlideComponent } from './components/poll-slide.component';

@NgModule({
    exports: [PollSlideComponent],
    imports: [
        CommonModule,
        MotionPollModule,
        AssignmentPollModule,
        TopicPollModule,
        IconContainerComponent,
        OpenSlidesTranslationModule.forChild()
    ],
    declarations: [PollSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: PollSlideComponent }]
})
export class PollSlideModule {}
