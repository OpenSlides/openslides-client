import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeetingInfoRoutingModule } from './meeting-info-routing.module';
import { MeetingInfoComponent } from './components/meeting-info/meeting-info.component';
import { MatCardModule } from '@angular/material/card';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { InfoModule } from 'src/app/site/modules/info';
import { CountUsersComponent } from './components/count-users/count-users.component';
import { UserStatisticsComponent } from './components/user-statistics/user-statistics.component';
import { ListModule } from 'src/app/ui/modules/list';

@NgModule({
    declarations: [MeetingInfoComponent, CountUsersComponent, UserStatisticsComponent],
    imports: [
        CommonModule,
        MeetingInfoRoutingModule,
        MatCardModule,
        HeadBarModule,
        ListModule,
        OpenSlidesTranslationModule.forChild(),
        InfoModule
    ]
})
export class MeetingInfoModule {}
