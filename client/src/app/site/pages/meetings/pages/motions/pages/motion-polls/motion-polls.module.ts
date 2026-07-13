import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ListModule } from '@app/ui/modules/list';

import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { MotionPollModule } from '../../modules/motion-poll';
import { MotionPollDetailComponent } from './components/motion-poll-detail/motion-poll-detail.component';
import { MotionPollMainComponent } from './components/motion-poll-main/motion-poll-main.component';
import { MotionPollsRoutingModule } from './motion-polls-routing.module';

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
