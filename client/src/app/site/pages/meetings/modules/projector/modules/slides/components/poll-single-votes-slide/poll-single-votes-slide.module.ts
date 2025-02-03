import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';

import { SlideToken } from '../../definitions';
import { PollSlideModule } from '../poll-slide/poll-slide.module';
import { PollSingleVotesSlideComponent } from './components/poll-single-votes-slide/poll-single-votes-slide.component';

@NgModule({
    imports: [
        CommonModule,
        MotionPollModule,
        PollSlideModule,
        IconContainerModule,
        OpenSlidesTranslationModule.forChild()
    ],
    declarations: [PollSingleVotesSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: PollSingleVotesSlideComponent }]
})
export class PollSingleVotesSlideModule {}
