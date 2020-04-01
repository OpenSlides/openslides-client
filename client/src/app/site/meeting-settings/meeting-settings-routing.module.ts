import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WatchForChangesGuard } from 'app/shared/utils/watch-for-changes.guard';
import { MeetingSettingsListComponent } from './components/meeting-settings-list/meeting-settings-list.component';
import { MeetingSettingsOverviewComponent } from './components/meeting-settings-overview/meeting-settings-overview.component';

const routes: Routes = [
    { path: '', component: MeetingSettingsOverviewComponent, pathMatch: 'full' },
    { path: ':group', component: MeetingSettingsListComponent, canDeactivate: [WatchForChangesGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingSettingsRoutingModule {}
