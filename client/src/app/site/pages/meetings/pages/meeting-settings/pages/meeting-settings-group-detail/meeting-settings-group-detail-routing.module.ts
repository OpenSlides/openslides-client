import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';

import { MeetingSettingsGroupDetailComponent } from './components/meeting-settings-group-detail/meeting-settings-group-detail.component';
import { MeetingSettingsGroupDetailMainComponent } from './components/meeting-settings-group-detail-main/meeting-settings-group-detail-main.component';

const routes: Routes = [
    {
        path: ``,
        component: MeetingSettingsGroupDetailMainComponent,
        canDeactivate: [WatchForChangesGuard],
        children: [
            {
                path: ``,
                component: MeetingSettingsGroupDetailComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingSettingsGroupDetailRoutingModule {}
