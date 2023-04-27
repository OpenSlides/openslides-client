import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeetingListComponent } from './components/meeting-list/meeting-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MeetingListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingListRoutingModule {}
