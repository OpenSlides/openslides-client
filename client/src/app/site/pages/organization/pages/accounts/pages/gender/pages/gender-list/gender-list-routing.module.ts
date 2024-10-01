import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GenderListComponent } from './components/gender-list/gender-list.component';

const routes: Routes = [
    {
        path: ``,
        component: GenderListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GenderListRoutingModule {}
