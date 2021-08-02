import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';
import { AssignmentDetailComponent } from './components/assignment-detail/assignment-detail.component';
import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';

const routes: Route[] = [
    { path: '', component: AssignmentListComponent, pathMatch: 'full' },
    { path: 'new', component: AssignmentDetailComponent, data: { basePerm: Permission.assignmentCanManage } },
    { path: ':id', component: AssignmentDetailComponent, data: { basePerm: Permission.assignmentCanSee } },
    {
        path: 'polls',
        loadChildren: () => import('./modules/assignment-poll/assignment-poll.module').then(m => m.AssignmentPollModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignmentsRoutingModule {}
