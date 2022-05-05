import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WatchForChangesGuard } from 'src/app/site/guards/watch-for-changes.guard';
import { MeetingSettingsGroupDetailComponent } from './components/meeting-settings-group-detail/meeting-settings-group-detail.component';

const routes: Routes = [
    {
        path: ``,
        component: MeetingSettingsGroupDetailComponent,
        canDeactivate: [WatchForChangesGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingSettingsGroupDetailRoutingModule {}
