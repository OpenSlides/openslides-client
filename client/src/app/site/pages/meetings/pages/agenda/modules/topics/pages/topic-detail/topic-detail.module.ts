import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicDetailRoutingModule } from './topic-detail-routing.module';
import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { TopicCommonServiceModule } from '../../services/topic-common-service.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatSelectModule } from '@angular/material/select';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { EditorModule } from 'src/app/ui/modules/editor';
import { PipesModule } from 'src/app/ui/pipes';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatInputModule } from '@angular/material/input';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';

@NgModule({
    declarations: [TopicDetailComponent],
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
        MatFormFieldModule
    ]
})
export class TopicDetailModule {}
