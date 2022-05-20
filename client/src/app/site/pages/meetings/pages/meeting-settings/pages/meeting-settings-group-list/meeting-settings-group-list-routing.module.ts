import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeetingSettingsGroupListComponent } from './components/meeting-settings-group-list/meeting-settings-group-list.component';

const routes: Routes = [
    {
        path: ``,
        component: MeetingSettingsGroupListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingSettingsGroupListRoutingModule {}
