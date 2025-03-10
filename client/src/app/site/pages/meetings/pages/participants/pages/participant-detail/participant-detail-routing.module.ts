import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

import { ParticipantDetailComponent } from './components/participant-detail/participant-detail.component';
import { ParticipantDetailEditComponent } from './components/participant-detail-edit/participant-detail-edit.component';
import { ParticipantDetailViewComponent } from './components/participant-detail-view/participant-detail-view.component';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantDetailComponent,
        children: [
            {
                path: `new`,
                loadChildren: () =>
                    import(`./pages/participant-detail-manage/participant-detail-manage.module`).then(
                        m => m.ParticipantDetailManageModule
                    ),
                data: { meetingPermissions: [Permission.userCanUpdate] },
                canLoad: [PermissionGuard]
            },
            {
                path: `:id`,
                component: ParticipantDetailViewComponent
            },
            {
                path: `:id/edit`,
                component: ParticipantDetailEditComponent,
                data: { meetingPermissions: [Permission.userCanUpdate] },
                canLoad: [PermissionGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantDetailRoutingModule {}
