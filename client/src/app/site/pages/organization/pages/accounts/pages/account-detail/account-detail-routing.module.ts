import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { AccountPasswordComponent } from './components/account-password/account-password.component';
import { AccountDetailMainComponent } from './components/account-detail-main/account-detail-main.component';

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
