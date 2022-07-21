import { Injectable } from '@angular/core';
import { Data, Router, UrlSegment } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { FallbackRoutesService } from './fallback-routes.service';
import { OpenSlidesRouterService } from './openslides-router.service';
import { OperatorService } from './operator.service';

@Injectable({
    providedIn: `root`
})
export class RerouteService {
    public constructor(
        private router: Router,
        private fallbackRoutesService: FallbackRoutesService,
        private operator: OperatorService,
        private osRouter: OpenSlidesRouterService
    ) {}

    /**
     * Handles a forbidden route. If the route is "/" (start page), It is tried to
     * use a fallback route provided by AuthGuardFallbackRoutes. If this won't work
     * or it wasn't the start page in the first place, the operator will be redirected
     * to an error page.
     */
    public async handleForbiddenRoute(routeData: Data, segments: UrlSegment[], url?: string): Promise<void> {
        if (segments.length === 0) {
            const fallbackMeetingId = Number.isNaN(this.osRouter.getMeetingId(url))
                ? null
                : this.osRouter.getMeetingId(url);
            // start page
            const fallbackRoute = this.fallbackRoutesService.getFallbackRoute();
            if (fallbackRoute && (this.operator.user || fallbackMeetingId)) {
                this.router.navigate([fallbackMeetingId ?? this.operator.user.meeting_ids[0], fallbackRoute]);
                return;
            }
        }
        const routeParams = await firstValueFrom(this.osRouter.currentParamMap);
        const meetingId = routeParams?.[`meetingId`];

        let routeDataArray = [];
        if (routeData?.[`meetingPermissions`]) {
            routeDataArray = routeDataArray.concat(routeData[`meetingPermissions`]);
        }
        if (routeData?.[`omlPermissions`]) {
            routeDataArray = routeDataArray.concat(routeData[`omlPermissions`]);
        }

        const queryParams = {
            error: `Authorization Error`,
            msg: routeDataArray
        };
        this.router.navigate([`error`], {
            queryParams: meetingId
                ? {
                      meetingId,
                      ...queryParams
                  }
                : queryParams
        });
    }

    /**
     * If the user requested a route without direct meaning, forward to their meaningful meeting
     */
    public forwardToOnlyMeeting(segments: string[] = []): void {
        try {
            const meetingId = this.operator.onlyMeeting;
            this.router.navigate([meetingId, ...segments]);
        } catch (e) {
            throw new Error(`Error when trying to forward to only meeting: ${e?.message}`);
        }
    }

    public toLogin(): void {
        this.osRouter.navigateToLogin();
    }
}
