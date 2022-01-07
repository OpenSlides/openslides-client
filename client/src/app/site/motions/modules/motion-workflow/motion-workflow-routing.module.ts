import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { WorkflowDetailSortComponent } from './components/workflow-detail-sort/workflow-detail-sort.component';

import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowImportComponent } from './components/workflow-import/workflow-import.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';

const routes: Route[] = [
    { path: ``, component: WorkflowListComponent, pathMatch: `full` },
    { path: `import`, component: WorkflowImportComponent },
    {
        path: `:id`,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: WorkflowDetailComponent
            },
            {
                path: `sort`,
                component: WorkflowDetailSortComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MotionWorkflowRoutingModule {}
