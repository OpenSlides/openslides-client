import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentMainComponent } from './components/assignment-main/assignment-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AssignmentMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./pages/assignment-list/assignment-list.module`).then(m => m.AssignmentListModule)
            },
            {
                path: `polls`,
                loadChildren: () =>
                    import(`./pages/assignment-polls/assignment-polls.module`).then(m => m.AssignmentPollsModule)
            },
            {
                path: `new`,
                loadChildren: () =>
                    import(`./pages/assignment-detail/assignment-detail.module`).then(m => m.AssignmentDetailModule)
            },
            {
                path: `edit`,
                loadChildren: () =>
                    import(`./pages/assignment-detail/assignment-detail.module`).then(m => m.AssignmentDetailModule)
            },
            {
                path: `:id`,
                loadChildren: () =>
                    import(`./pages/assignment-detail/assignment-detail.module`).then(m => m.AssignmentDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignmentsRoutingModule {}
