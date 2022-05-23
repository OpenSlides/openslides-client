import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AssignmentsRoutingModule } from './assignments-routing.module';
import { AssignmentMainComponent } from './components/assignment-main/assignment-main.component';

@NgModule({
    declarations: [AssignmentMainComponent],
    imports: [CommonModule, AssignmentsRoutingModule, RouterModule]
})
export class AssignmentsModule {}
