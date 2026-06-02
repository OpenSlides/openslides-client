import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { MeetingsComponentCollectorModule } from '../../modules/meetings-component-collector';
import { PollMainComponent } from './components/poll-main/poll-main.component';
import { PollsRoutingModule } from './polls-routing.module';

@NgModule({
    declarations: [PollMainComponent],
    imports: [
        PollsRoutingModule,
        CommonModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatTooltipModule,
        RouterModule,
        CommonModule
    ]
})
export class PollsModule {}
