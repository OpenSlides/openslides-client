import { Injectable, Injector } from '@angular/core';
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivateFn,
    DeprecatedGuard,
    Router,
    RoutesRecognized,
    UrlTree
} from '@angular/router';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    isObservable,
    map,
    Observable,
    Subject,
    tap
} from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    ActiveMeetingIdService,
    MeetingIdChangedEvent
} from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { AuthService } from 'src/app/site/services/auth.service';

import { UpdateService } from '../modules/site-wrapper/services/update.service';
import { OperatorService } from './operator.service';

enum UrlTarget {
    LOGIN = `login`,
    ORGANIZATION_LAYER = `organization_layer`
}

@Injectable({
    providedIn: `root`
})
export class OpenSlidesRouterService {
    private preLoginRedirectUrl: UrlTree;

    public get currentParamMap(): Observable<Record<string, any>> {
        return this._currentParamMap;
    }

    public get beforeSignoutObservable(): Observable<boolean> {
        return this._nextUrlTargetSubject.pipe(map(nextTarget => nextTarget === UrlTarget.LOGIN));
    }

    public get beforeLeaveMeetingObservable(): Observable<boolean> {
        return this._nextUrlTargetSubject.pipe(map(nextTarget => nextTarget === UrlTarget.ORGANIZATION_LAYER));
    }

    public get meetingIdChanged(): Observable<MeetingIdChangedEvent> {
        return this.activeMeetingIdService.meetingIdChanged;
    }

    private readonly _nextUrlTargetSubject = new Subject<UrlTarget>();
    private readonly _currentParamMap = new BehaviorSubject<Record<string, any>>({});

    private _currentUrl: string | null = null;
    private _currentMeetingId: Id | null = null;

    public constructor(
        _auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private injector: Injector,
        private activeMeetingIdService: ActiveMeetingIdService,
        private updateService: UpdateService,
        private operator: OperatorService
    ) {
        _auth.logoutObservable.subscribe(() => {
            this.navigateToLogin(true);
        });
        router.events
            .pipe(
                filter(event => event instanceof RoutesRecognized),
                tap(event => this.checkNextTarget(event as any)),
                map((event: any) => this.buildParamMap(event.state.root)),
                distinctUntilChanged()
            )
            .subscribe(event => this._currentParamMap.next(event));
        activeMeetingIdService.meetingIdChanged.subscribe(event => console.log(`has meeting changed?`, event));

        this.operator.operatorUpdated.subscribe(() => {
            if (!this.operator.knowsMultipleMeetings && !this.activeMeetingIdService.meetingId) {
                this.checkCurrentRouteGuards();
            }
        });
        this.operator.permissionsObservable
            .pipe(
                filter(v => !!v),
                map(v => JSON.stringify(v.filter(p => p.indexOf(`can_see`) !== -1))),
                distinctUntilChanged()
            )
            .subscribe(_ => {
                this.checkCurrentRouteGuards();
            });
    }

    public navigateToLogin(logout = false): void {
        const url = this.router.currentNavigation()?.extractedUrl.toString() || this.router.routerState.snapshot.url;

        // Navigate to login if the user is not already there
        if (!url.startsWith(`/${UrlTarget.LOGIN}`) && !new RegExp(`^/[0-9]+/${UrlTarget.LOGIN}`).test(url)) {
            const queryParams: Record<string, any> = {};
            if (!logout) {
                this.setNextAfterLoginUrl(url);
                if (this.preLoginRedirectUrl && this.preLoginRedirectUrl.toString() !== `/`) {
                    queryParams[`prevUrl`] = this.preLoginRedirectUrl;
                }
            }

            this.router.navigate([`/`, UrlTarget.LOGIN], {
                queryParams
            });
        }
    }

    public navigateAfterLogin(meetingId?: number): void {
        let baseRoute: string | UrlTree = meetingId ? `${meetingId}/` : `/`;
        if (this.preLoginRedirectUrl) {
            baseRoute = this.preLoginRedirectUrl.toString();
            this.preLoginRedirectUrl = null;
        }

        if (this.updateService.updateAvailable) {
            const baseUrl = this.router.serializeUrl(this.router.createUrlTree([baseRoute]));
            location.href = baseUrl;
        } else {
            this.router.navigate([baseRoute], {
                state: {
                    redirectOnGuardFail: true
                }
            });
        }
    }

    public setNextAfterLoginUrl(url: string | UrlTree): void {
        this.preLoginRedirectUrl = typeof url === `string` ? this.router.createUrlTree([url]) : url;
    }

    /**
     * Returns true if an url is not meeting-specific
     */
    public isOrganizationUrl(url: string): boolean {
        const urlSegments = url.slice(1).split(`/`);
        return !urlSegments[0] || Number.isNaN(Number(urlSegments[0]));
    }

    public getCurrentMeetingId(): number {
        const url = this.router.currentNavigation()?.extractedUrl.toString() || this.router.routerState.snapshot.url;
        const segments = url.split(`/`);
        const meetingIdString = segments.length > 1 ? segments[1] : segments[0];
        return Number(meetingIdString) || null;
    }

    public getMeetingId(info: string): number {
        const segments = info.split(`/`);
        const meetingIdString = segments.length > 1 ? segments[1] : segments[0];
        return Number(meetingIdString);
    }

    /**
     * Checks if user can still access the current page
     */
    public async checkCurrentRouteGuards(): Promise<boolean> {
        if (this.route.root.firstChild) {
            const result = await this.checkRouteGuards(this.route.root.firstChild);
            if (typeof result !== `boolean`) {
                this.router.navigateByUrl(result);
                return false;
            }

            return result;
        }

        return true;
    }

    private async checkRouteGuards(route: ActivatedRoute): Promise<boolean | UrlTree> {
        const routeSnapshot = route.snapshot;
        const config = routeSnapshot.routeConfig;
        const conditions: Promise<boolean | UrlTree>[] = [
            ...(config?.canActivate?.map(guard => this.validateGuard(guard, route, `canActivate`)) || []),
            ...(config?.canActivateChild?.map(guard => this.validateGuard(guard, route, `canActivateChild`)) || []),
            ...(config?.canLoad?.map(guard => this.validateGuard(guard, route, `canLoad`)) || [])
        ];

        const conditionResults = await Promise.all(conditions);
        if (conditionResults.some(r => r !== true)) {
            let redirect: boolean | UrlTree = false;
            for (const r of conditionResults) {
                if (typeof r !== `boolean`) {
                    redirect = r;
                }
            }
            return redirect;
        }

        if (route.firstChild) {
            return await this.checkRouteGuards(route.firstChild);
        }

        return true;
    }

    private async validateGuard(
        guardToken: CanActivateFn | DeprecatedGuard,
        route: ActivatedRoute,
        type: `canActivateChild` | `canActivate` | `canLoad`
    ): Promise<boolean | UrlTree> {
        const guard = this.injector.get(guardToken);
        const routerStateSnapshot = Object.assign({}, route.snapshot, { url: this.router.url });
        const result = guard[type](route.snapshot, routerStateSnapshot);

        if (isObservable(result)) {
            return await firstValueFrom(result as Observable<boolean | UrlTree>);
        } else if (typeof result?.then === `function`) {
            return await result;
        }

        return true;
    }

    private buildParamMap(rootSnapshot: ActivatedRouteSnapshot): Record<string, any> {
        const paramMap: Record<string, any> = {};
        this._toParamMap(rootSnapshot, paramMap);
        return paramMap;
    }

    private _toParamMap(currentRoute: ActivatedRouteSnapshot, paramMap: Record<string, any>): void {
        for (const [key, value] of Object.entries(currentRoute.queryParams ?? {})) {
            paramMap[key] = value;
        }
        for (const [key, value] of Object.entries(currentRoute.params ?? {})) {
            paramMap[key] = value;
        }
        for (const childRoute of currentRoute.children || []) {
            this._toParamMap(childRoute, paramMap);
        }
    }

    private checkNextTarget(event: RoutesRecognized): void {
        if (event.url === `/${UrlTarget.LOGIN}` && this._currentUrl !== event.url) {
            this._nextUrlTargetSubject.next(UrlTarget.LOGIN);
        } else if (event.url === `/` && !!this._currentMeetingId && this.activeMeetingIdService.meetingId === null) {
            this._nextUrlTargetSubject.next(UrlTarget.ORGANIZATION_LAYER);
        }
        this._currentUrl = event.url;
        this._currentMeetingId = this.activeMeetingIdService.meetingId;
    }
}
