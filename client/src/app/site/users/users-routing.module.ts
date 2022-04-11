import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { Permission } from 'app/core/core-services/permission';

import { GroupListComponent } from './components/group-list/group-list.component';
import { PasswordComponent } from './components/password/password.component';
import { PresenceDetailComponent } from './components/presence-detail/presence-detail.component';
import { UserCreateWizardComponent } from './components/user-create-wizard/user-create-wizard.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserImportListComponent } from './components/user-import/user-import-list.component';
import { UserListComponent } from './components/user-list/user-list.component';

const routes: Route[] = [
    {
        path: ``,
        component: UserListComponent,
        pathMatch: `full`
    },
    {
        path: `password`,
        component: PasswordComponent
    },
    {
        path: `password/:id`,
        component: PasswordComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: `new`,
        component: UserCreateWizardComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: `import`,
        component: UserImportListComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: `presence`,
        component: PresenceDetailComponent,
        data: { basePerm: Permission.userCanManage, meetingSetting: `users_enable_presence_view` }
    },
    {
        path: `groups`,
        component: GroupListComponent,
        data: { basePerm: Permission.userCanManage }
    },
    {
        path: `:id`,
        component: UserDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
