import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        loadChildren: () =>
            import(`./pages/meeting-settings-group-list/meeting-settings-group-list.module`).then(
                m => m.MeetingSettingsGroupListModule
            )
    },
    {
        path: `:group`,
        loadChildren: () =>
            import(`./pages/meeting-settings-group-detail/meeting-settings-group-detail.module`).then(
                m => m.MeetingSettingsGroupDetailModule
            )
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MeetingSettingsRoutingModule {}
