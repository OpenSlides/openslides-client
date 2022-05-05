import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentsRoutingModule } from './assignments-routing.module';
import { AssignmentMainComponent } from './components/assignment-main/assignment-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [AssignmentMainComponent],
    imports: [CommonModule, AssignmentsRoutingModule, RouterModule]
})
export class AssignmentsModule {}
