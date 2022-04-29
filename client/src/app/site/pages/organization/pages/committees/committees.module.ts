import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteesRoutingModule } from './committees-routing.module';
import { CommitteeCommonServiceModule } from './services/committee-common-service.module';
import { CommitteeMainModule } from './pages/committee-main/committee-main.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, CommitteesRoutingModule, CommitteeCommonServiceModule, CommitteeMainModule]
})
export class CommitteesModule {}
