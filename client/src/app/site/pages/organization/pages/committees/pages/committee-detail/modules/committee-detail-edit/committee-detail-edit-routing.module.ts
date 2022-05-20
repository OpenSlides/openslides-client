import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommitteeDetailEditComponent } from './components/committee-detail-edit/committee-detail-edit.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeDetailEditComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommitteeDetailEditRoutingModule {}
