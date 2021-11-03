import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { CommonRoutingModule } from './common-routing.module';
import { CountUsersComponent } from './components/count-users/count-users.component';
import { ErrorComponent } from './components/error/error.component';
import { InfoComponent } from './components/info/info.component';
import { StartComponent } from './components/start/start.component';
import { UserStatisticsComponent } from './components/user-statistics/user-statistics.component';

@NgModule({
    imports: [CommonModule, CommonRoutingModule, SharedModule],
    declarations: [StartComponent, CountUsersComponent, ErrorComponent, UserStatisticsComponent, InfoComponent]
})
export class OsCommonModule {}
