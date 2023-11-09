import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubdivisionListComponent } from './components/subdivision-list/subdivision-list.component';

const routes: Routes = [
    {
        path: ``,
        component: SubdivisionListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubdivisionListRoutingModule {}
