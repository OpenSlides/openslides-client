import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { ListOfSpeakersContentModule } from '@app/site/pages/meetings/modules/list-of-speakers-content/list-of-speakers-content.module';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { AttachmentControlModule } from '@app/site/pages/meetings/modules/meetings-component-collector/attachment-control';
import { PollComponent } from '@app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { DirectivesModule } from '@app/ui/directives';
import { EditorModule } from '@app/ui/modules/editor';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes';

import { AgendaForwardDialogComponent } from '../../../../components/agenda-forward-dialog/components/agenda-forward-dialog/agenda-forward-dialog.component';
import { TopicPollModule } from '../../modules/topic-poll/topic-poll.module';
import { TopicCommonServiceModule } from '../../services/topic-common-service.module';
import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { TopicDetailMainComponent } from './components/topic-detail-main/topic-detail-main.component';
import { TopicDetailRoutingModule } from './topic-detail-routing.module';

@NgModule({
    declarations: [TopicDetailComponent, TopicDetailMainComponent],
    imports: [
        CommonModule,
        TopicDetailRoutingModule,
        TopicCommonServiceModule,
        HeadBarModule,
        PipesModule,
        PollComponent,
        DirectivesModule,
        AttachmentControlModule,
        MeetingsComponentCollectorModule,
        SearchSelectorModule,
        EditorModule,
        OpenSlidesTranslationModule.forChild(),
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule,
        MatMenuModule,
        MatCardModule,
        MatIconModule,
        MatListModule,
        MatFormFieldModule,
        MatTooltipModule,
        TopicPollModule,
        RouterModule,
        IconContainerComponent,
        ListOfSpeakersContentModule,
        AgendaForwardDialogComponent
    ]
})
export class TopicDetailModule {}
