import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';

import { Settings } from '../../shared/models/event-management/meeting';
import { MeetingSettingsService } from '../ui-services/meeting-settings.service';
import { ActiveMeetingService } from './active-meeting.service';
import { FallbackRoutesService } from './fallback-routes.service';
import { OpenSlidesRouterService } from './openslides-router.service';
import { OperatorService } from './operator.service';
import { Permission } from './permission';

enum CannotAccessReason {
    NO_MEANING = 1,
    NO_PERM,
    NO_SETTING
}
/**
 * Classical Auth-Guard. Checks if the user has to correct permissions to enter a page, and forwards to login if not.
 */
@Injectable({
    providedIn: `root`
})
export class AuthGuard implements CanActivate, CanActivateChild {
    private cannotAccessReason: CannotAccessReason;
    /**
     * Constructor
     *
     * @param router To navigate to a target URL
     * @param operator Asking for the required permission
     * @param openSlidesService Handle OpenSlides functions
     */
    public constructor(
        private router: Router,
        private operator: OperatorService,
        private activeMeeting: ActiveMeetingService,
        private meetingSettingService: MeetingSettingsService,
        private fallbackRoutesService: FallbackRoutesService,
        private osRouter: OpenSlidesRouterService
    ) {}

    /**
     * Checks of the operator has the required permission to see the state.
     *
     * One can set extra data to the state with `data: {basePerm: '<perm>'}` or
     * `data: {basePerm: ['<perm1>', '<perm2>']}` to lock the access to users
     * only with the given permission(s).
     *
     * @param route the route the user wants to navigate to
     */
    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (!(await this.hasStateMeaning(state))) {
            this.cannotAccessReason = CannotAccessReason.NO_MEANING;
            return false;
        }
        const basePerm: Permission | Permission[] = route.data.basePerm;
        if (!basePerm) {
            return true;
        }
        const meetingSetting: keyof Settings = route.data.meetingSetting;
        await this.operator.ready;
        if ((this.operator.isAnonymous && this.activeMeeting.guestsEnabled) || this.operator.isAuthenticated) {
            const hasPerm = !!this.activeMeeting.meetingId ? this.hasPerms(basePerm) : true;
            const hasSetting = this.isMeetingSettingEnabled(meetingSetting);
            if (!hasSetting) {
                this.cannotAccessReason = CannotAccessReason.NO_SETTING;
            } else if (hasPerm) {
                this.cannotAccessReason = CannotAccessReason.NO_PERM;
            }
            return hasPerm && hasSetting;
        } else {
            this.osRouter.navigateToLogin();
            return false;
        }
    }

    /**
     * Calls {@method canActivate}. Should have the same logic.
     *
     * @param route the route the user wants to navigate to
     */
    public async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        await this.operator.ready;
        const canActivateRoute = await this.canActivate(route, state);

        if (canActivateRoute) {
            return true;
        } else {
            if (this.cannotAccessReason === CannotAccessReason.NO_MEANING) {
                this.forwardToOnlyMeeting();
            } else {
                this.handleForbiddenRoute(route);
            }
        }
    }

    /**
     * Determine if the route has any (real) meaning for the user
     */
    private async hasStateMeaning(state: RouterStateSnapshot): Promise<boolean> {
        if (state.url === `/`) {
            await this.operator.ready;
            return this.operator.knowsMultipleMeetings;
        }
        return true;
    }

    private hasPerms(basePerm: Permission | Permission[]): boolean {
        if (!basePerm) {
            return true;
        } else if (basePerm instanceof Array) {
            return this.operator.hasPerms(...basePerm);
        } else {
            return this.operator.hasPerms(basePerm);
        }
    }

    private isMeetingSettingEnabled(meetingSetting?: keyof Settings): boolean {
        if (!meetingSetting) {
            return true;
        }
        return this.meetingSettingService.instant(meetingSetting) as boolean;
    }

    /**
     * Handles a forbidden route. If the route is "/" (start page), It is tried to
     * use a fallback route provided by AuthGuardFallbackRoutes. If this won't work
     * or it wasn't the start page in the first place, the operator will be redirected
     * to an error page.
     */
    private handleForbiddenRoute(route: ActivatedRouteSnapshot): void {
        if (route.url.length === 0) {
            // start page
            const fallbackRoute = this.fallbackRoutesService.getFallbackRoute();
            if (fallbackRoute) {
                this.router.navigate([fallbackRoute]);
                return;
            }
        }
        const routeParams = route.parent?.params;
        const meetingId = routeParams?.meetingId;

        if (meetingId) {
            this.router.navigate([meetingId, `error`], {
                queryParams: {
                    error: `Authentication Error`,
                    msg: route.data.basePerm
                }
            });
        } else {
            this.osRouter.navigateToLogin();
        }
    }

    /**
     * If the user requested a route without direct meaning, forward to their meaningful meeting
     */
    private forwardToOnlyMeeting(): void {
        const meetingId = this.operator.onlyMeeting;
        this.router.navigate([meetingId]);
    }
}
