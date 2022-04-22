import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { TopicPollComponent } from './components/topic-poll/topic-poll.component';
import { TopicPollDetailContentComponent } from './components/topic-poll-detail-content/topic-poll-detail-content.component';
import { TopicPollDialogComponent } from './components/topic-poll-dialog/topic-poll-dialog.component';
import { TopicPollFormComponent } from './components/topic-poll-form/topic-poll-form.component';
import { TopicPollMetaInfoComponent } from './components/topic-poll-meta-info/topic-poll-meta-info.component';
import { TopicPollVoteComponent } from './components/topic-poll-vote/topic-poll-vote.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { TopicPollService } from './services/topic-poll.service';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { TopicPollServiceModule } from './services/topic-poll-service.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProjectorButtonModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { MatMenuModule } from '@angular/material/menu';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopicCommonServiceModule } from '../../services/topic-common-service.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { DirectivesModule } from 'src/app/ui/directives';

@NgModule({
    declarations: [
        TopicPollComponent,
        TopicPollDetailContentComponent,
        TopicPollDialogComponent,
        TopicPollMetaInfoComponent,
        TopicPollVoteComponent,
        TopicPollFormComponent
    ],
    imports: [
        CommonModule,
        TopicPollServiceModule,
        TopicCommonServiceModule,
        FormsModule,
        ReactiveFormsModule,
        PollModule,
        MatDialogModule,
        MatButtonModule,
        ChoiceDialogModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        SearchSelectorModule,
        IconContainerModule,
        MatCardModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        SortingListModule,
        ProjectorButtonModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [TopicPollComponent, TopicPollVoteComponent, TopicPollDetailContentComponent],
    providers: [{ provide: PollService, useClass: TopicPollService }]
})
export class TopicPollModule {}
