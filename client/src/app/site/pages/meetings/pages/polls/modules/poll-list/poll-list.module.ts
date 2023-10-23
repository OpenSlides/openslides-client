import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { PollListComponent } from './components/poll-list/poll-list.component';
import { PollListRoutingModule } from './poll-list-routing.module';
import { PollListServiceModule } from './services/poll-list-service.module';

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
