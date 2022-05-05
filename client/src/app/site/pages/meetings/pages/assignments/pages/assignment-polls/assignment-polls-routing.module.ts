import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentPollDetailComponent } from './components/assignment-poll-detail/assignment-poll-detail.component';
import { AssignmentPollMainComponent } from './components/assignment-poll-main/assignment-poll-main.component';

const routes: Routes = [
    {
        path: `:id`,
        component: AssignmentPollMainComponent,
        children: [
            {
                path: ``,
                component: AssignmentPollDetailComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignmentPollsRoutingModule {}
