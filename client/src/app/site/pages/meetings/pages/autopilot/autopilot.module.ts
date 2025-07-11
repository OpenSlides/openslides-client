import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
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

import { ProjectorButtonModule } from '../../modules/meetings-component-collector/projector-button/projector-button.module';
import { ProjectorComponent } from '../../modules/projector/components/projector/projector.component';
import { CountdownTimeModule } from '../../modules/projector/modules/countdown-time/countdown-time.module';
import { ProjectorModule } from '../../modules/projector/projector.module';
import { TopicPollModule } from '../agenda/modules/topics/modules/topic-poll/topic-poll.module';
import { InteractionServiceModule } from '../interaction/services/interaction-service.module';
import { AutopilotRoutingModule } from './autopilot-routing.module';
import { AutopilotComponent } from './components/autopilot/autopilot.component';
import { AutopilotMainComponent } from './components/autopilot-main/autopilot-main.component';
import { AutopilotSettingsComponent } from './components/autopilot-settings/autopilot-settings.component';
import { PollCollectionComponent } from './components/poll-collection/poll-collection.component';

@NgModule({
    declarations: [AutopilotMainComponent, AutopilotSettingsComponent, AutopilotComponent, PollCollectionComponent],
    imports: [
        CommonModule,
        RouterModule,
        AutopilotRoutingModule,
        InteractionServiceModule,
        FormsModule,
        ProjectorModule,
        ProjectorComponent,
        DirectivesModule,
        MatCardModule,
        MatCheckboxModule,
        MatProgressBarModule,
        MatTabsModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatIconModule,
        MatDialogModule,
        MatBadgeModule,
        ListOfSpeakersContentModule,
        HeadBarModule,
        CountdownTimeModule,
        OpenSlidesTranslationModule.forChild(),
        PollModule,
        MotionPollModule,
        MatMenuModule,
        TopicPollModule,
        AssignmentPollModule,
        ReactiveFormsModule,
        MatInputModule,
        ProjectorButtonModule
    ]
})
export class AutopilotModule {}
