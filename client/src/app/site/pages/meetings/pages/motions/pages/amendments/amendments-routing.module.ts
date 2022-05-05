import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmendmentListComponent } from './components/amendment-list/amendment-list.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: AmendmentListComponent
    },
    {
        path: `:id`,
        component: AmendmentListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AmendmentsRoutingModule {}
