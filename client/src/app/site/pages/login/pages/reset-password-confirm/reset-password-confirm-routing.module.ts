import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetPasswordConfirmComponent } from './components/reset-password-confirm/reset-password-confirm.component';

const routes: Routes = [
    {
        path: ``,
        component: ResetPasswordConfirmComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ResetPasswordConfirmRoutingModule {}
