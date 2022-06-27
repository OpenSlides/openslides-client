import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';

import { AuthCheckService } from '../services/auth-check.service';
import { OpenSlidesRouterService } from '../services/openslides-router.service';
import { OperatorService } from '../services/operator.service';
import { RerouteService } from '../services/reroute.service';

enum CannotAccessReason {
    NO_MEANING = 1,
    NO_PERM,
    NO_SETTING
}

@Injectable({
    providedIn: `root`
})
export class AuthGuard implements CanActivate, CanActivateChild {
    private _cannotAccessReason: CannotAccessReason | null = null;

    public constructor(
        private reroute: RerouteService,
        private osRouter: OpenSlidesRouterService,
        private operator: OperatorService,
        private authCheck: AuthCheckService
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
        if (this.hasAlreadyBeenChecked(state)) {
            return true;
        }
        this._cannotAccessReason = null;
        if (this.osRouter.isOrganizationUrl(state.url)) {
            if (!(await this.authCheck.isAuthorizedToSeeOrganization())) {
                this._cannotAccessReason = CannotAccessReason.NO_MEANING;
                return false;
            }
        } else if (!(await this.authCheck.isInMeeting(state.url))) {
            return false;
        }
        if (!(await this.authCheck.isAuthenticated())) {
            this.reroute.toLogin();
            return false;
        }
        return await this.authCheck.isAuthorized(route.data);
    }

    /**
     * Calls {@method canActivate}. Should have the same logic.
     *
     * @param route the route the user wants to navigate to
     */
    public async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (this.hasAlreadyBeenChecked(state)) {
            return true;
        }
        await this.operator.ready;
        const canActivateRoute = await this.canActivate(route, state);

        if (canActivateRoute) {
            return true;
        } else {
            if (this._cannotAccessReason === CannotAccessReason.NO_MEANING) {
                this.reroute.forwardToOnlyMeeting(state.url === `/info` ? [`info`] : []);
            } else {
                this.reroute.handleForbiddenRoute(route.data, route.url);
            }
        }
        return false;
    }

    /**
     * True if the permission guard has returned true for the current url immediately before this function is called.
     * Helps to avoid unneccassary re-calculation of the same information.
     */
    private hasAlreadyBeenChecked(state: RouterStateSnapshot): boolean {
        return state.url === this.authCheck.lastSuccessfulUrl;
    }
}
