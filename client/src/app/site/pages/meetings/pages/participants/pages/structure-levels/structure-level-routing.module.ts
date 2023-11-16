import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StructureLevelDetailComponent } from './components/structure-level-detail/structure-level-detail.component';
import { StructureLevelListComponent } from './components/structure-level-list/structure-level-list.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: StructureLevelListComponent
    },
    {
        path: `:id`,
        component: StructureLevelDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StructureLevelRoutingModule {}
