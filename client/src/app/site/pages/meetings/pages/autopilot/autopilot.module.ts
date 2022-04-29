import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutopilotRoutingModule } from './autopilot-routing.module';
import { AutopilotComponent } from './components/autopilot/autopilot.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ListOfSpeakersContentModule } from 'src/app/site/pages/meetings/modules/list-of-speakers-content';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { InteractionServiceModule } from '../interaction/services/interaction-service.module';
import { ProjectorModule } from '../../modules/projector/projector.module';
import { PollCollectionComponent } from './components/poll-collection/poll-collection.component';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { MotionPollModule } from 'src/app/site/pages/meetings/pages/motions/modules/motion-poll';
import { AssignmentPollModule } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [AutopilotComponent, PollCollectionComponent],
    imports: [
        CommonModule,
        RouterModule,
        AutopilotRoutingModule,
        PromptDialogModule,
        InteractionServiceModule,
        ProjectorModule,
        DirectivesModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        ListOfSpeakersContentModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        PollModule,
        MotionPollModule,
        AssignmentPollModule
    ]
})
export class AutopilotModule {}
