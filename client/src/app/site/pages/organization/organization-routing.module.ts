import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OML } from '../../../domain/definitions/organization-permission';
import { AuthGuard } from '../../guards/auth.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { OrganizationNavigationWrapperComponent } from './modules/navigation/organization-navigation-wrapper/organization-navigation-wrapper.component';

const routes: Routes = [
    {
        path: ``,
        component: OrganizationNavigationWrapperComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () => import(`./pages/dashboard/dashboard.module`).then(m => m.DashboardModule),
                canLoad: [PermissionGuard]
            },
            {
                path: `committees`,
                loadChildren: () => import(`./pages/committees/committees.module`).then(m => m.CommitteesModule),
                canLoad: [PermissionGuard]
            },
            {
                path: `accounts`,
                loadChildren: () => import(`./pages/accounts/accounts.module`).then(m => m.AccountsModule),
                data: { omlPermissions: [OML.can_manage_users] },
                canLoad: [PermissionGuard]
            },
            {
                path: `designs`,
                loadChildren: () => import(`./pages/designs/designs.module`).then(m => m.DesignsModule),
                data: { omlPermissions: [OML.can_manage_organization] },
                canLoad: [PermissionGuard]
            },
            {
                path: `organization-tags`,
                loadChildren: () =>
                    import(`./pages/organization-tags/organization-tags.module`).then(m => m.OrganizationTagsModule),
                data: { omlPermissions: [OML.can_manage_organization] },
                canLoad: [PermissionGuard]
            },
            {
                path: `settings`,
                loadChildren: () => import(`./pages/settings/settings.module`).then(m => m.SettingsModule),
                data: { omlPermissions: [OML.can_manage_organization] },
                canLoad: [PermissionGuard]
            },
            {
                path: `info`,
                loadChildren: () =>
                    import(`./pages/organization-info/organization-info.module`).then(m => m.OrganizationInfoModule),
                canLoad: [PermissionGuard]
            }
        ],
        canActivateChild: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationRoutingModule {}
