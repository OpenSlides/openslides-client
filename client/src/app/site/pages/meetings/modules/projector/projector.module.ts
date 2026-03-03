import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { TopicPollServiceModule } from '../../pages/agenda/modules/topics/modules/topic-poll/services/topic-poll-service.module';
import { AssignmentPollServiceModule } from '../../pages/assignments/modules/assignment-poll/services/assignment-poll-service.module';
import { MotionPollServiceModule } from '../../pages/motions/modules/motion-poll';
import { CountdownTimeModule } from './modules/countdown-time/countdown-time.module';

const EXPORTED_MODULES = [CountdownTimeModule];

@NgModule({
    exports: [...EXPORTED_MODULES],
    imports: [
        CommonModule,
        MatIconModule,
        DirectivesModule,
        AssignmentPollServiceModule,
        MotionPollServiceModule,
        TopicPollServiceModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorModule {}
