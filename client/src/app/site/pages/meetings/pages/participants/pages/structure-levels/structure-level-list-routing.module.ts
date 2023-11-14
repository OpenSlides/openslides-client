import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StructureLevelListComponent } from './components/structure-level-list/structure-level-list.component';

const routes: Routes = [
    {
        path: ``,
        component: StructureLevelListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StructureLevelListRoutingModule {}
