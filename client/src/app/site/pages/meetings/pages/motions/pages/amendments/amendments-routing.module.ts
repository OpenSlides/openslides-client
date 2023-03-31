import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AmendmentListComponent } from './components/amendment-list/amendment-list.component';
import { AmendmentListMainComponent } from './components/amendment-list-main/amendment-list-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AmendmentListMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: AmendmentListComponent
            },
            {
                path: `:id`,
                component: AmendmentListComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AmendmentsRoutingModule {}
