import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommitteesRoutingModule } from './committees-routing.module';
import { CommitteeMainModule } from './pages/committee-main/committee-main.module';
import { CommitteeCommonServiceModule } from './services/committee-common-service.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, CommitteesRoutingModule, CommitteeCommonServiceModule, CommitteeMainModule]
})
export class CommitteesModule {}
