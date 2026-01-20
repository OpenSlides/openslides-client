import { Injectable } from '@angular/core';
import { Data, Router, UrlSegment, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';

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
     * or it wasn't the start page in the first place, a url to an error page is
     * returned.
     */
    public async handleForbiddenRoute(routeData: Data, segments: UrlSegment[], url?: string): Promise<UrlTree> {
        const state = this.router.currentNavigation()?.extras?.state || {};
        if (state[`redirectOnGuardFail`]) {
            return this.router.createUrlTree([`/`]);
        }

        if (segments.length === 0) {
            const fallbackMeetingId = Number.isNaN(this.osRouter.getMeetingId(url))
                ? null
                : this.osRouter.getMeetingId(url);
            // start page
            const fallbackRoute = this.fallbackRoutesService.getFallbackRoute();
            if (fallbackRoute && (this.operator.user || fallbackMeetingId)) {
                return this.router.createUrlTree([
                    fallbackMeetingId ?? this.operator.user.ensuredMeetingIds[0],
                    fallbackRoute
                ]);
            }
        }
        const routeParams = await firstValueFrom(this.osRouter.currentParamMap);
        const meetingId: Id = Number(routeParams?.[`meetingId`]);

        let routeDataArray = [];
        if (routeData?.[`meetingPermissions`]) {
            routeDataArray = routeDataArray.concat(routeData[`meetingPermissions`]);
        }
        if (routeData?.[`omlPermissions`]) {
            routeDataArray = routeDataArray.concat(routeData[`omlPermissions`]);
        }
        if (routeData?.[`optionalCmlPermissions`]) {
            routeDataArray = routeDataArray.concat(
                routeData[`optionalCmlPermissions`].map(perm => `committee.` + perm)
            );
        }

        const queryParams = {
            error: `Authorization Error`,
            msg: routeDataArray
        };
        return this.router.createUrlTree(
            meetingId && this.operator.hasMeetingAccess(meetingId) ? [meetingId, `error`] : [`error`],
            {
                queryParams: meetingId
                    ? {
                          meetingId,
                          ...queryParams
                      }
                    : queryParams
            }
        );
    }

    /**
     * Return users url to their meaningful meeting
     */
    public getOnlyMeetingUrlTree(segments: string[] = []): UrlTree {
        const meetingId = this.operator.onlyMeeting;
        return this.router.createUrlTree([meetingId, ...segments]);
    }

    public toLogin(previousUrl: UrlTree | string): UrlTree {
        if (previousUrl) {
            this.osRouter.setNextAfterLoginUrl(previousUrl);
        }

        if (this.osRouter.getCurrentMeetingId()) {
            return this.router.createUrlTree([this.osRouter.getCurrentMeetingId(), `login`]);
        }

        return this.router.createUrlTree([`login`]);
    }
}
