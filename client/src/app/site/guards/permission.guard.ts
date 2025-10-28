import { Injectable } from '@angular/core';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';

import { AuthCheckService } from '../services/auth-check.service';
import { OpenSlidesRouterService } from '../services/openslides-router.service';
import { RerouteService } from '../services/reroute.service';

@Injectable({
    providedIn: `root`
})
export class PermissionGuard {
    public constructor(
        private router: Router,
        private reroute: RerouteService,
        private osRouter: OpenSlidesRouterService,
        private authCheck: AuthCheckService
    ) {}

    public async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean | UrlTree> {
        const url = this.getCurrentNavigationUrl();
        if (this.isLoginPage(url)) {
            return true;
        }

        if (this.osRouter.isOrganizationUrl(url)) {
            if (!(await this.authCheck.isAuthorizedToSeeOrganization())) {
                return this.reroute.getOnlyMeetingUrlTree(url === `/info` ? [`info`] : []);
            }
        } else if (!(await this.authCheck.hasAccessToMeeting(url))) {
            return await this.reroute.handleForbiddenRoute(route.data, segments, url);
        }
        if (!(await this.authCheck.isAuthenticated(url))) {
            return this.reroute.toLogin(url);
        }
        if (route.data && !(await this.authCheck.isAuthorized(route.data))) {
            return await this.reroute.handleForbiddenRoute(route.data, segments, url);
        }
        this.authCheck.lastSuccessfulUrl = url;
        return true;
    }

    /**
     * Workaround for getting the current url because canLoad's 'segments' parameter currently does not supply the whole route.
     * Can be replaced as soon as segments is guaranteed to contain the whole url
     * @returns the current navigation's url
     */
    public getCurrentNavigationUrl(): string {
        return this.router.currentNavigation()?.extractedUrl.toString() || this.router.url;
    }

    private isLoginPage(url: string): boolean {
        return url.startsWith(`/login`) || new RegExp(`^[0-9]+login`).test(url);
    }
}
