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
        if (this.osRouter.isOrganizationUrl(this.getCurrentNavigationUrl())) {
            if (!(await this.authCheck.isAuthorizedToSeeOrganization())) {
                this.reroute.forwardToOnlyMeeting(this.getCurrentNavigationUrl() === `/info` ? [`info`] : []);
                return false;
            }
        } else if (!(await this.authCheck.isInMeeting(this.getCurrentNavigationUrl()))) {
            this.reroute.handleForbiddenRoute(route.data, segments);
        }
        if (route.data) {
            if (!(await this.authCheck.isAuthenticated())) {
                this.reroute.toLogin();
                return false;
            } else if (!(await this.authCheck.isAuthorized(route.data))) {
                this.reroute.handleForbiddenRoute(route.data, segments);
                return false;
            }
        }
        this.authCheck.lastSuccessfulUrl = this.getCurrentNavigationUrl();
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
