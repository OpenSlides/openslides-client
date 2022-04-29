import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PollListRoutingModule } from './poll-list-routing.module';
import { PollListComponent } from './components/poll-list/poll-list.component';
import { PollListServiceModule } from './services/poll-list-service.module';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [PollListComponent],
    imports: [
        CommonModule,
        PollListRoutingModule,
        PollListServiceModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatTooltipModule
    ]
})
export class PollListModule {}
