import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';

import { AuthCheckService } from '../services/auth-check.service';
import { OpenSlidesRouterService } from '../services/openslides-router.service';
import { RerouteService } from '../services/reroute.service';

@Injectable({
    providedIn: `root`
})
export class PermissionGuard implements CanLoad {
    public constructor(
        private router: Router,
        private reroute: RerouteService,
        private osRouter: OpenSlidesRouterService,
        private authCheck: AuthCheckService
    ) {}

    public async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
        const url = this.getCurrentNavigationUrl();
        if (this.osRouter.isOrganizationUrl(url)) {
            if (!(await this.authCheck.isAuthorizedToSeeOrganization())) {
                this.reroute.forwardToOnlyMeeting(url === `/info` ? [`info`] : []);
                return false;
            }
        } else if (!(await this.authCheck.hasAccessToMeeting(url))) {
            this.reroute.handleForbiddenRoute(route.data, segments, url);
        }
        if (!(await this.authCheck.isAuthenticated())) {
            this.reroute.toLogin();
            return false;
        }
        if (route.data && !(await this.authCheck.isAuthorized(route.data))) {
            this.reroute.handleForbiddenRoute(route.data, segments, url);
            return false;
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
        return this.router.getCurrentNavigation().extractedUrl.toString();
    }
}
