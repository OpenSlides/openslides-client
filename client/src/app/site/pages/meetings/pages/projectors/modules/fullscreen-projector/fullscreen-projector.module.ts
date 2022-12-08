import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';

import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { TopicPollServiceModule } from '../../../agenda/modules/topics/modules/topic-poll/services/topic-poll-service.module';
import { AssignmentPollServiceModule } from '../../../assignments/modules/assignment-poll/services/assignment-poll-service.module';
import { MotionPollServiceModule } from '../../../motions/modules/motion-poll';
import { FullscreenProjectorComponent } from './components/fullscreen-projector/fullscreen-projector.component';
import { FullscreenProjectorDetailComponent } from './components/fullscreen-projector-detail/fullscreen-projector-detail.component';
import { FullscreenProjectorMainComponent } from './components/fullscreen-projector-main/fullscreen-projector-main.component';
import { FullscreenProjectorRoutingModule } from './fullscreen-projector-routing.module';

@NgModule({
    declarations: [FullscreenProjectorMainComponent, FullscreenProjectorDetailComponent, FullscreenProjectorComponent],
    imports: [
        CommonModule,
        FullscreenProjectorRoutingModule,
        RouterModule,
        ProjectorModule,
        DirectivesModule,
        MeetingsComponentCollectorModule,
        AssignmentPollServiceModule,
        MotionPollServiceModule,
        TopicPollServiceModule
    ]
})
export class FullscreenProjectorModule {}
