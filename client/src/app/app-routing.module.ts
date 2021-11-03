import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, Route, RouteReuseStrategy, RouterModule } from '@angular/router';

/**
 * Global app routing
 */
const routes: Route[] = [
    {
        path: `login`,
        loadChildren: () => import(`./site/login/login.module`).then(m => m.LoginModule)
    },
    {
        path: ``,
        loadChildren: () => import(`./main/main.module`).then(m => m.MainModule)
    },
    { path: `**`, redirectTo: `` }
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
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: `reload`, relativeLinkResolution: `legacy` })],
    exports: [RouterModule],
    providers: [{ provide: RouteReuseStrategy, useClass: MyStrategy }]
})
export class AppRoutingModule {}
