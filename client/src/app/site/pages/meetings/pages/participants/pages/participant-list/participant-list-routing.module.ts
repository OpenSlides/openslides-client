import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParticipantListComponent } from './components/participant-list/participant-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantListRoutingModule {}
