import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountListMainComponent } from './components/account-list-main/account-list-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AccountListMainComponent,
        children: [
            {
                path: ``,
                component: AccountListComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountListRoutingModule {}
