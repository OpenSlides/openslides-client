import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

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
