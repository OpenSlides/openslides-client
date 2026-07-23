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
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { ProjectorButtonModule } from '@app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { PollModule } from '@app/site/pages/meetings/modules/poll';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from '@app/ui/directives';
import { ChoiceDialogComponent } from '@app/ui/modules/choice-dialog';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { CustomIconComponent } from '@app/ui/modules/custom-icon';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { SortingListModule } from '@app/ui/modules/sorting/modules';

import { TopicCommonServiceModule } from '../../services/topic-common-service.module';
import { TopicPollComponent } from './components/topic-poll/topic-poll.component';
import { TopicPollDialogComponent } from './components/topic-poll-dialog/topic-poll-dialog.component';
import { TopicPollService } from './services/topic-poll.service';
import { TopicPollServiceModule } from './services/topic-poll-service.module';

@NgModule({
    declarations: [],
    imports: [
        CustomIconComponent,
        CommonModule,
        CommaSeparatedListingComponent,
        TopicPollComponent,
        TopicPollDialogComponent,
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
    exports: [TopicPollComponent],
    providers: [{ provide: PollService, useClass: TopicPollService }]
})
export class TopicPollModule {}
