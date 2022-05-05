import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParticipantPasswordComponent } from './components/participant-password/participant-password.component';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: ParticipantPasswordComponent
    },
    {
        path: `:id`,
        component: ParticipantPasswordComponent,
        data: { meetingPermissions: [Permission.userCanManage] },
        canLoad: [PermissionGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantPasswordRoutingModule {}
