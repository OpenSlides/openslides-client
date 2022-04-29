import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDetailRoutingModule } from './committee-detail-routing.module';
import { CommitteeDetailComponent } from './components/committee-detail/committee-detail.component';
import { RouterModule } from '@angular/router';
import { CommitteeDetailServiceModule } from './services';
import { CommitteeCommonServiceModule } from '../../services/committee-common-service.module';

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
