import { Injectable } from '@angular/core';
import { Router, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, filter, map, Observable, distinctUntilChanged, Subject, tap } from 'rxjs';
import { AuthService } from 'src/app/site/services/auth.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { Id } from 'src/app/domain/definitions/key-types';

const URL_LOGIN_PREFIX = `/login`;

enum UrlTarget {
    LOGIN = `login`,
    ORGANIZATION_LAYER = `organization_layer`
}

@Injectable({
    providedIn: 'root'
})
export class OpenSlidesRouterService {
    public get currentParamMap(): Observable<{ [paramName: string]: any }> {
        return this._currentParamMap.asObservable();
    }

    public get beforeSignoutObservable(): Observable<boolean> {
        return this._nextUrlTargetSubject.pipe(map(nextTarget => nextTarget === UrlTarget.LOGIN));
    }

    public get beforeLeaveMeetingObservable(): Observable<boolean> {
        return this._nextUrlTargetSubject.pipe(map(nextTarget => nextTarget === UrlTarget.ORGANIZATION_LAYER));
    }

    private readonly _nextUrlTargetSubject = new Subject<UrlTarget>();
    private readonly _currentParamMap = new BehaviorSubject<{ [paramName: string]: any }>({});

    private _currentUrl: string | null = null;
    private _currentMeetingId: Id | null = null;

    public constructor(
        _auth: AuthService,
        private router: Router,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        _auth.logoutObservable.subscribe(() => {
            this.navigateToLogin();
        });
        router.events
            .pipe(
                filter(event => event instanceof RoutesRecognized),
                tap(event => this.checkNextTarget(event as any)),
                map((event: any) => {
                    return this.buildParamMap(event.state.root);
                }),
                distinctUntilChanged()
            )
            .subscribe(event => this._currentParamMap.next(event));
    }

    public navigateToLogin(): void {
        const url = this.router.routerState.snapshot.url;

        // First, check if a user is already at the login page
        if (url.startsWith(URL_LOGIN_PREFIX) && url.length >= URL_LOGIN_PREFIX.length) {
            return;
        }

        // Then, check if a user is at any orga-specific route
        // if the first fragment is a number, we are in a meeting
        this.router.navigate([`/`, `login`]);
    }

    private buildParamMap(rootSnapshot: ActivatedRouteSnapshot): { [paramName: string]: any } {
        const paramMap: { [paramName: string]: any } = {};
        this._toParamMap(rootSnapshot, paramMap);
        return paramMap;
    }

    private _toParamMap(currentRoute: ActivatedRouteSnapshot, paramMap: { [paramName: string]: any }): void {
        for (const [key, value] of Object.entries(currentRoute.params ?? {})) {
            paramMap[key] = value;
        }
        for (const childRoute of currentRoute.children || []) {
            this._toParamMap(childRoute, paramMap);
        }
    }

    private checkNextTarget(event: RoutesRecognized): void {
        if (event.url === URL_LOGIN_PREFIX && this._currentUrl !== event.url) {
            this._nextUrlTargetSubject.next(UrlTarget.LOGIN);
        } else if (event.url === `/` && !!this._currentMeetingId && this.activeMeetingIdService.meetingId === null) {
            this._nextUrlTargetSubject.next(UrlTarget.ORGANIZATION_LAYER);
        }
        this._currentUrl = event.url;
        this._currentMeetingId = this.activeMeetingIdService.meetingId;
    }
}
