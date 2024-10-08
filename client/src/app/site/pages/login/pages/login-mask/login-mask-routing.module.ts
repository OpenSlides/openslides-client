import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginMaskComponent } from './components/login-mask/login-mask.component';

const routes: Routes = [
    {
        path: ``,
        pathMatch: `full`,
        component: LoginMaskComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginMaskRoutingModule {}
