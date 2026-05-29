import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { TranslateKeyPipe } from 'src/app/ui/pipes/translate-key/translate-key.pipe';

import { PollListRoutingModule } from '../../../pages/polls/modules/poll-list/poll-list-routing.module';
import { PollListServiceModule } from '../../../pages/polls/modules/poll-list/services/poll-list-service.module';
import { PollDetailComponent } from './poll-detail/poll-detail.component';

@NgModule({
    imports: [
        CommonModule,
        PollListRoutingModule,
        PollListServiceModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        MatIconModule,
        MatTooltipModule,
        TranslateKeyPipe,
        PollDetailComponent,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class PollDetailModule {}
