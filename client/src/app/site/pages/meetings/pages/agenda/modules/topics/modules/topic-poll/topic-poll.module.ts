import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ProjectorButtonModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { CustomIconModule } from 'src/app/ui/modules/custom-icon';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules';

import { TopicCommonServiceModule } from '../../services/topic-common-service.module';
import { TopicPollComponent } from './components/topic-poll/topic-poll.component';
import { TopicPollDetailContentComponent } from './components/topic-poll-detail-content/topic-poll-detail-content.component';
import { TopicPollDialogComponent } from './components/topic-poll-dialog/topic-poll-dialog.component';
import { TopicPollFormComponent } from './components/topic-poll-form/topic-poll-form.component';
import { TopicPollMetaInfoComponent } from './components/topic-poll-meta-info/topic-poll-meta-info.component';
import { TopicPollVoteComponent } from './components/topic-poll-vote/topic-poll-vote.component';
import { TopicPollService } from './services/topic-poll.service';
import { TopicPollServiceModule } from './services/topic-poll-service.module';

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
        CustomIconModule,
        CommonModule,
        CommaSeparatedListingModule,
        TopicPollServiceModule,
        TopicCommonServiceModule,
        FormsModule,
        ReactiveFormsModule,
        PollModule,
        MatDialogModule,
        MatButtonModule,
        ChoiceDialogComponent,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        SearchSelectorModule,
        IconContainerComponent,
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
