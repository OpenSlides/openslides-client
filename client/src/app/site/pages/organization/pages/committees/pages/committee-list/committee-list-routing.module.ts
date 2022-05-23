import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommitteeListComponent } from './components/committee-list/committee-list.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommitteeListRoutingModule {}
