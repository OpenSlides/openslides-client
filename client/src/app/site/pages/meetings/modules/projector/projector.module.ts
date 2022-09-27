import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DirectivesModule } from 'src/app/ui/directives';

import { TopicPollServiceModule } from '../../pages/agenda/modules/topics/modules/topic-poll/services/topic-poll-service.module';
import { AssignmentPollServiceModule } from '../../pages/assignments/modules/assignment-poll/services/assignment-poll-service.module';
import { MotionPollServiceModule } from '../../pages/motions/modules/motion-poll';
import { ProjectorComponent } from './components/projector/projector.component';
import { ProjectorClockComponent } from './components/projector-clock/projector-clock.component';
import { SlideContainerComponent } from './components/slide-container/slide-container.component';
import { CountdownTimeModule } from './modules/countdown-time/countdown-time.module';
import { SlidesModule } from './modules/slides/slides.module';

const DECLARATIONS = [ProjectorComponent];
const EXPORTED_MODULES = [CountdownTimeModule];

@NgModule({
    declarations: [...DECLARATIONS, ProjectorClockComponent, SlideContainerComponent],
    exports: [...DECLARATIONS, ...EXPORTED_MODULES],
    imports: [
        CommonModule,
        MatIconModule,
        DirectivesModule,
        SlidesModule,
        AssignmentPollServiceModule,
        MotionPollServiceModule,
        TopicPollServiceModule
    ]
})
export class ProjectorModule {}
