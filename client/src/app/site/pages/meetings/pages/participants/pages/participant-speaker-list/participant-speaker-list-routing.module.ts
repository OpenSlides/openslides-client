import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParticipantSpeakerListComponent } from './components/participant-speaker-list/participant-speaker-list.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantSpeakerListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantSpeakerListRoutingModule {}
