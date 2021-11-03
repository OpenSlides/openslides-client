import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginLegalNoticeComponent } from './components/login-legal-notice/login-legal-notice.component';
import { LoginMaskComponent } from './components/login-mask/login-mask.component';
import { LoginPrivacyPolicyComponent } from './components/login-privacy-policy/login-privacy-policy.component';
import { LoginWrapperComponent } from './components/login-wrapper/login-wrapper.component';
import { UnsupportedBrowserComponent } from './components/unsupported-browser/unsupported-browser.component';

const routes: Routes = [
    {
        path: ``,
        component: LoginWrapperComponent,
        children: [
            { path: ``, component: LoginMaskComponent, pathMatch: `full` },
            { path: `legalnotice`, component: LoginLegalNoticeComponent },
            { path: `privacypolicy`, component: LoginPrivacyPolicyComponent },
            { path: `unsupported-browser`, component: UnsupportedBrowserComponent },
            {
                path: `forget-password`,
                loadChildren: () =>
                    import(`./components/reset-password/reset-password.module`).then(m => m.ResetPasswordModule)
            },
            {
                path: `forget-password-confirm`,
                loadChildren: () =>
                    import(`./components/reset-password-confirm/reset-password-confirm.module`).then(
                        m => m.ResetPasswordConfirmModule
                    )
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginRoutingModule {}
