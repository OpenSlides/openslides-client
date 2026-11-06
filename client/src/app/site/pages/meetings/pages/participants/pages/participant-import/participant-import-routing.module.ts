import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParticipantImportListComponent } from './components/participant-import-list/participant-import-list.component';
import { ParticipantImportListPreviewComponent } from './components/participant-import-list-preview/participant-import-list-preview.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantImportListComponent
    },
    {
        path: `preview`,
        component: ParticipantImportListPreviewComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantImportRoutingModule {}
