import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountMainComponent } from './components/account-main/account-main.component';

const routes: Routes = [
    {
        path: ``,
        component: AccountMainComponent,
        children: [
            {
                path: ``,
                pathMatch: `full`,
                loadChildren: () => import(`./pages/account-list/account-list.module`).then(m => m.AccountListModule)
            },
            {
                path: `meeting/:meetingId`,
                children: [
                    {
                        path: ``,
                        pathMatch: `full`,
                        loadChildren: () =>
                            import(`./pages/account-list/account-list.module`).then(m => m.AccountListModule)
                    },
                    {
                        path: `:id`,
                        loadChildren: () =>
                            import(`./pages/account-detail/account-detail.module`).then(m => m.AccountDetailModule)
                    }
                ]
            },
            {
                path: `create`,
                loadChildren: () =>
                    import(`./pages/account-detail/account-detail.module`).then(m => m.AccountDetailModule)
            },
            {
                path: `import`,
                loadChildren: () =>
                    import(`./pages/account-import/account-import.module`).then(m => m.AccountImportModule)
            },
            {
                path: `gender`,
                loadChildren: () =>
                    import(`./pages/gender/pages/gender-list/gender-list.module`).then(m => m.GenderListModule)
            },
            {
                path: `:id`,
                loadChildren: () =>
                    import(`./pages/account-detail/account-detail.module`).then(m => m.AccountDetailModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule {}
