import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AssignmentsRoutingModule } from './assignments-routing.module';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';
import { AssignmentPollModule } from './modules/assignment-poll/assignment-poll.module';

@NgModule({
    imports: [CommonModule, AssignmentsRoutingModule, AssignmentPollModule, SharedModule],
    declarations: [AssignmentDetailComponent, AssignmentListComponent]
})
export class AssignmentsModule {}
