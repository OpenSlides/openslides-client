import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { Permission } from 'app/core/core-services/permission';
import { GroupListComponent } from './components/group-list/group-list.component';
import { PasswordComponent } from './components/password/password.component';
import { PresenceDetailComponent } from './components/presence-detail/presence-detail.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserImportListComponent } from './components/user-import/user-import-list.component';
import { UserListComponent } from './components/user-list/user-list.component';

const routes: Route[] = [
    {
        path: '',
        component: UserListComponent,
        pathMatch: 'full',
        data: { basePerm: Permission.userCanSee }
    },
    {
        path: 'password',
        component: PasswordComponent
    },
    {
        path: 'password/:id',
        component: PasswordComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: 'new',
        component: UserDetailComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: 'import',
        component: UserImportListComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: 'presence',
        component: PresenceDetailComponent,
        // TODO: 'users_enable_presence_view' missing in permissions
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: 'groups',
        component: GroupListComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: ':id',
        component: UserDetailComponent
        // No basePerm, because user is allowed to see the own profile page.
        // Other user detail pages are empty if user does not have user.can_see_name.
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
