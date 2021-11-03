import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResetPasswordComponent } from './reset-password.component';

const ROUTES: Routes = [
    {
        path: ``,
        component: ResetPasswordComponent,
        pathMatch: `full`
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class ResetPasswordRoutingModule {}
