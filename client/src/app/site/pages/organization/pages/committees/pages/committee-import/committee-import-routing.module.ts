import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommitteeImportListComponent } from './components/committee-import-list/committee-import-list.component';

const routes: Routes = [
    {
        path: ``,
        component: CommitteeImportListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommitteeImportRoutingModule {}
