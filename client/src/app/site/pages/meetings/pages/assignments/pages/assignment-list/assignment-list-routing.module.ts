import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssignmentListComponent } from './components/assignment-list/assignment-list.component';

const routes: Routes = [
    {
        path: ``,
        component: AssignmentListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignmentListRoutingModule {}
