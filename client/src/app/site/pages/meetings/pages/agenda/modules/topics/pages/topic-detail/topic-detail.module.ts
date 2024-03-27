import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

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
        TopicPollModule,
        RouterModule
    ]
})
export class TopicDetailModule {}
