import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WorkflowDetailSortComponent } from './components/workflow-detail-sort/workflow-detail-sort.component';

import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowImportComponent } from './components/workflow-import/workflow-import.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { MotionWorkflowRoutingModule } from './motion-workflow-routing.module';

@NgModule({
    declarations: [
        WorkflowListComponent,
        WorkflowDetailComponent,
        WorkflowImportComponent,
        WorkflowDetailSortComponent
    ],
    imports: [CommonModule, MotionWorkflowRoutingModule, SharedModule]
})
export class MotionWorkflowModule {}
