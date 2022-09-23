import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowDetailSortComponent } from './components/workflow-detail-sort/workflow-detail-sort.component';
import { WorkflowImportComponent } from './components/workflow-import/workflow-import.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: WorkflowListComponent
    },
    {
        path: `import`,
        component: WorkflowImportComponent
    },
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
export class WorkflowsRoutingModule {}
