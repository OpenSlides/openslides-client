import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';

import { AuthCheckService } from '../services/auth-check.service';
import { OpenSlidesRouterService } from '../services/openslides-router.service';
import { OperatorService } from '../services/operator.service';
import { RerouteService } from '../services/reroute.service';

@Injectable({
    providedIn: `root`
})
export class PermissionGuard implements CanLoad {
    public constructor(
        private router: Router,
        private reroute: RerouteService,
        private osRouter: OpenSlidesRouterService,
        private operator: OperatorService,
        private authCheck: AuthCheckService
    ) {}

    public async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean | UrlTree> {
        const url = this.getCurrentNavigationUrl();
        if (this.osRouter.isOrganizationUrl(url)) {
            if (!(await this.authCheck.isAuthorizedToSeeOrganization())) {
                const meetingId = this.operator.onlyMeeting.toString();
                return this.router.createUrlTree(url === `/info` ? [meetingId, `info`] : [meetingId]);
            }
        } else if (!(await this.authCheck.hasAccessToMeeting(url))) {
            return await this.reroute.handleForbiddenRoute(route.data, segments, url);
        }
        if (!(await this.authCheck.isAuthenticated())) {
            return this.reroute.toLogin();
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
        return this.router.getCurrentNavigation()?.extractedUrl.toString() || this.router.url;
    }
}
