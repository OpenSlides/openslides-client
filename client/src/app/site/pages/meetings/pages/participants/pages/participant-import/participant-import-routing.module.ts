import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantImportListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantImportRoutingModule {}
