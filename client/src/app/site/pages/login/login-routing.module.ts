import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginWrapperComponent } from './modules/login-wrapper/components/login-wrapper/login-wrapper.component';

const routes: Routes = [
    {
        path: ``,
        component: LoginWrapperComponent,
        children: [
            {
                path: `realms/:realm/protocol/openid-connect/auth`,
                loadChildren: () => import(`./pages/login-mask/login-mask.module`).then(m => m.LoginMaskModule)
            },
            {
                path: `realms/:realm/login-actions/authenticate`,
                loadChildren: () => import(`./pages/login-mask/login-mask.module`).then(m => m.LoginMaskModule)
            },
            {
                path: `legalnotice`,
                loadChildren: () => import(`./pages/legal-notice/legal-notice.module`).then(m => m.LegalNoticeModule)
            },
            {
                path: `privacypolicy`,
                loadChildren: () =>
                    import(`./pages/privacy-policy/privacy-policy.module`).then(m => m.PrivacyPolicyModule)
            },
            {
                path: `unsupported-browser`,
                loadChildren: () =>
                    import(`./pages/unsupported-browser/unsupported-browser.module`).then(
                        m => m.UnsupportedBrowserModule
                    )
            },
            {
                path: `forget-password`,
                loadChildren: () =>
                    import(`./pages/reset-password/reset-password.module`).then(m => m.ResetPasswordModule)
            },
            {
                path: `forget-password-confirm`,
                loadChildren: () =>
                    import(`./pages/reset-password-confirm/reset-password-confirm.module`).then(
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
