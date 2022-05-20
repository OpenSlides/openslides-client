import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { AccountDetailMainComponent } from './components/account-detail-main/account-detail-main.component';
import { AccountPasswordComponent } from './components/account-password/account-password.component';

const routes: Routes = [
    {
        path: ``,
        component: AccountDetailMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                component: AccountDetailComponent
            },
            {
                path: `edit`,
                component: AccountDetailComponent
            },
            {
                path: `password`,
                component: AccountPasswordComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountDetailRoutingModule {}
