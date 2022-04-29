import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Permission } from 'src/app/domain/definitions/permission';
import { ParticipantMainComponent } from './components/participant-main/participant-main.component';
import { PermissionGuard } from 'src/app/site/guards/permission.guard';

const routes: Routes = [
    {
        path: ``,
        component: ParticipantMainComponent,
        children: [
            // {
            //     path: ``,
            //     component: UserListComponent,
            //     pathMatch: `full`
            // },
            // {
            //     path: `new`,
            //     component: UserDetailComponent,
            //     data: { basePerm: Permission.userCanManage }
            // },
            // {
            //     path: `import`,
            //     component: UserImportListComponent,
            //     data: { basePerm: Permission.userCanManage }
            // },
            // {
            //     path: `presence`,
            //     component: PresenceDetailComponent,
            //     data: { basePerm: Permission.userCanManage, meetingSetting: `users_enable_presence_view` }
            // },
            // {
            //     path: `:id`,
            //     component: UserDetailComponent
            // },
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () =>
                    import(`./pages/participant-list/participant-list.module`).then(m => m.ParticipantListModule)
            },
            {
                path: `import`,
                loadChildren: () =>
                    import(`./pages/participant-import/participant-import.module`).then(m => m.ParticipantImportModule),
                data: { meetingPermissions: [Permission.userCanManage] }
                // canLoad: [PermissionGuard]
            },
            {
                path: `password`,
                loadChildren: () =>
                    import(`./pages/participant-password/participant-password.module`).then(
                        m => m.ParticipantPasswordModule
                    )
            },
            {
                path: `presence`,
                loadChildren: () =>
                    import(`./pages/participant-presence/participant-presence.module`).then(
                        m => m.ParticipantPresenceModule
                    ),
                data: {
                    meetingPermissions: [Permission.userCanManage],
                    meetingSettings: [`users_enable_presence_view`]
                }
                // canLoad: [PermissionGuard]
            },
            {
                path: `groups`,
                loadChildren: () => import(`./modules/groups/groups.module`).then(m => m.GroupsModule),
                data: { meetingPermissions: [Permission.userCanManage] }
                // canLoad: [PermissionGuard]
            },
            {
                path: ``,
                loadChildren: () =>
                    import(`./pages/participant-detail/participant-detail.module`).then(m => m.ParticipantDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ParticipantsRoutingModule {}
