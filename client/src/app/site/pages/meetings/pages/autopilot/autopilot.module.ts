import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ListOfSpeakersContentModule } from 'src/app/site/pages/meetings/modules/list-of-speakers-content';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { AssignmentPollModule } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { CountdownTimeModule } from '../../modules/projector/modules/countdown-time/countdown-time.module';
import { ProjectorModule } from '../../modules/projector/projector.module';
import { TopicPollModule } from '../agenda/modules/topics/modules/topic-poll/topic-poll.module';
import { InteractionServiceModule } from '../interaction/services/interaction-service.module';
import { AutopilotRoutingModule } from './autopilot-routing.module';
import { AutopilotComponent } from './components/autopilot/autopilot.component';
import { AutopilotMainComponent } from './components/autopilot-main/autopilot-main.component';
import { PollCollectionComponent } from './components/poll-collection/poll-collection.component';
import { SpeakingTimesComponent } from './components/speaking-times/speaking-times.component';

@NgModule({
    declarations: [AutopilotMainComponent, AutopilotComponent, PollCollectionComponent, SpeakingTimesComponent],
    imports: [
        CommonModule,
        RouterModule,
        AutopilotRoutingModule,
        PromptDialogModule,
        InteractionServiceModule,
        ProjectorModule,
        DirectivesModule,
        MatCardModule,
        MatProgressBarModule,
        MatTabsModule,
        MatTooltipModule,
        MatIconModule,
        ListOfSpeakersContentModule,
        HeadBarModule,
        CountdownTimeModule,
        OpenSlidesTranslationModule.forChild(),
        PollModule,
        MotionPollModule,
        TopicPollModule,
        AssignmentPollModule
    ]
})
export class AutopilotModule {}
