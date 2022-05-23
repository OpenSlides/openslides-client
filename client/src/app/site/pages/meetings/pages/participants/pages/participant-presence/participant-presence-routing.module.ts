import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParticipantPresenceComponent } from './components/participant-presence/participant-presence.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantPresenceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantPresenceRoutingModule {}
