import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ActionCardModule } from 'src/app/ui/modules/action-card/action-card.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { TopicPollServiceModule } from '../../../agenda/modules/topics/modules/topic-poll/services/topic-poll-service.module';
import { AssignmentPollServiceModule } from '../../../assignments/modules/assignment-poll/services/assignment-poll-service.module';
import { MotionPollServiceModule } from '../../../motions/modules/motion-poll';
import { ProjectorEditDialogModule } from '../../components/projector-edit-dialog/projector-edit-dialog.module';
import { ProjectorListComponent } from './components/projector-list/projector-list.component';
import { ProjectorListEntryComponent } from './components/projector-list-entry/projector-list-entry.component';
import { ProjectorListRoutingModule } from './projector-list-routing.module';

@NgModule({
    declarations: [ProjectorListComponent, ProjectorListEntryComponent],
    imports: [
        CommonModule,
        ProjectorListRoutingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        HeadBarModule,
        PromptDialogModule,
        ProjectorModule,
        ActionCardModule,
        DirectivesModule,
        ProjectorEditDialogModule,
        AssignmentPollServiceModule,
        MotionPollServiceModule,
        TopicPollServiceModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorListModule {}
