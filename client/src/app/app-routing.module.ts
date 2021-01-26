import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, Route, RouteReuseStrategy, RouterModule } from '@angular/router';

import { LoginLegalNoticeComponent } from './site/login/components/login-legal-notice/login-legal-notice.component';
import { LoginMaskComponent } from './site/login/components/login-mask/login-mask.component';
import { LoginPrivacyPolicyComponent } from './site/login/components/login-privacy-policy/login-privacy-policy.component';
import { LoginWrapperComponent } from './site/login/components/login-wrapper/login-wrapper.component';
import { ResetPasswordConfirmComponent } from './site/login/components/reset-password-confirm/reset-password-confirm.component';
import { ResetPasswordComponent } from './site/login/components/reset-password/reset-password.component';
import { UnsupportedBrowserComponent } from './site/login/components/unsupported-browser/unsupported-browser.component';

/**
 * Global app routing
 */
const routes: Route[] = [
    {
        path: 'login',
        component: LoginWrapperComponent,
        children: [
            { path: '', component: LoginMaskComponent, pathMatch: 'full' },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: 'reset-password-confirm', component: ResetPasswordConfirmComponent },
            { path: 'legalnotice', component: LoginLegalNoticeComponent },
            { path: 'privacypolicy', component: LoginPrivacyPolicyComponent },
            { path: 'unsupported-browser', component: UnsupportedBrowserComponent }
        ]
    },
    {
        path: 'projector',
        loadChildren: () =>
            import('./fullscreen/fullscreen-projector/fullscreen-projector.module').then(
                m => m.FullscreenProjectorModule
            ),
        data: { noInterruption: true }
    },
    {
        path: 'download',
        loadChildren: () => import('./fullscreen/download/download.module').then(m => m.DownloadModule)
    },
    { path: '', loadChildren: () => import('./site/site.module').then(m => m.SiteModule) },
    { path: '**', redirectTo: '' }
];

@Injectable()
export class MyStrategy extends RouteReuseStrategy {
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
    }
    public store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return false;
    }
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return null;
    }
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig || (future?.data.reuseComponent && curr?.data.reuseComponent);
    }
}

@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
    providers: [{ provide: RouteReuseStrategy, useClass: MyStrategy }]
})
export class AppRoutingModule {}
