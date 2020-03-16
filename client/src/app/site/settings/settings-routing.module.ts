import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WatchForChangesGuard } from 'app/shared/utils/watch-for-changes.guard';
import { SettingsListComponent } from './components/settings-list/settings-list.component';
import { SettingsOverviewComponent } from './components/settings-overview/settings-overview.component';

const routes: Routes = [
    { path: '', component: SettingsOverviewComponent, pathMatch: 'full' },
    { path: ':group', component: SettingsListComponent, canDeactivate: [WatchForChangesGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsRoutingModule {}
