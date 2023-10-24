import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';
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
        LegacyEditorModule,
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
