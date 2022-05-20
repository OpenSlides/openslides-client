import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountImportListComponent } from './components/account-import-list/account-import-list.component';

const routes: Routes = [
    {
        path: ``,
        component: AccountImportListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountImportRoutingModule {}
