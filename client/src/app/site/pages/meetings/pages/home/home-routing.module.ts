import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        loadChildren: () => import(`./pages/start/start.module`).then(m => m.StartModule),
        data: { meetingPermissions: [Permission.meetingCanSeeFrontpage] },
        canLoad: [PermissionGuard]
    },
    {
        path: `info`,
        loadChildren: () => import(`./pages/meeting-info/meeting-info.module`).then(m => m.MeetingInfoModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {}
