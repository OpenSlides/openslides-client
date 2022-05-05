import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionPollsRoutingModule } from './motion-polls-routing.module';
import { MotionPollMainComponent } from './components/motion-poll-main/motion-poll-main.component';
import { MotionPollDetailComponent } from './components/motion-poll-detail/motion-poll-detail.component';
import { RouterModule } from '@angular/router';
import { MotionPollModule } from '../../modules/motion-poll';
import { ListModule } from 'src/app/ui/modules/list';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { DirectivesModule } from 'src/app/ui/directives';

@NgModule({
    declarations: [MotionPollMainComponent, MotionPollDetailComponent],
    imports: [
        CommonModule,
        MotionPollsRoutingModule,
        RouterModule,
        MatMenuModule,
        MatIconModule,
        MatTabsModule,
        MatDividerModule,
        MatCardModule,
        MotionPollModule,
        ParticipantCommonServiceModule,
        DirectivesModule,
        HeadBarModule,
        ListModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionPollsModule {}
