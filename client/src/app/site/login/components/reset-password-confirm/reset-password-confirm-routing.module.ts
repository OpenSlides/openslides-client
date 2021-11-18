import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResetPasswordConfirmComponent } from './reset-password-confirm.component';

const ROUTES: Routes = [
    {
        path: ``,
        component: ResetPasswordConfirmComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class ResetPasswordConfirmRoutingModule {}
