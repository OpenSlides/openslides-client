import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';

const routes: Routes = [
    {
        path: ``,
        component: AgendaSortComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaSortRoutingModule {}
