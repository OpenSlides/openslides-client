import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommitteeCommonServiceModule } from '../../services/committee-common-service.module';
import { CommitteeDetailRoutingModule } from './committee-detail-routing.module';
import { CommitteeDetailComponent } from './components/committee-detail/committee-detail.component';
import { CommitteeDetailServiceModule } from './services';

@NgModule({
    declarations: [CommitteeDetailComponent],
    imports: [
        CommonModule,
        CommitteeDetailRoutingModule,
        CommitteeDetailServiceModule,
        CommitteeCommonServiceModule,
        RouterModule
    ]
})
export class CommitteeDetailModule {}
