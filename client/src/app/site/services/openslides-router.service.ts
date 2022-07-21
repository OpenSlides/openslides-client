import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RoutesRecognized } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, Subject, tap } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    ActiveMeetingIdService,
    MeetingIdChangedEvent
} from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { AuthService } from 'src/app/site/services/auth.service';

enum UrlTarget {
    LOGIN = `login`,
    ORGANIZATION_LAYER = `organization_layer`
}

@Injectable({
    providedIn: `root`
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

    public get meetingIdChanged(): Observable<MeetingIdChangedEvent> {
        return this.activeMeetingIdService.meetingIdChanged;
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
                map((event: any) => this.buildParamMap(event.state.root)),
                distinctUntilChanged()
            )
            .subscribe(event => this._currentParamMap.next(event));
        activeMeetingIdService.meetingIdChanged.subscribe(event => console.log(`has meeting changed?`, event));
    }

    public navigateToLogin(): void {
        const url = this.router.routerState.snapshot.url;

        // Navigate to login if the user is not already there
        if (!url.startsWith(`/${UrlTarget.LOGIN}`)) {
            this.router.navigate([`/`, UrlTarget.LOGIN]);
        }
    }

    /**
     * Returns true if an url is not meeting-specific
     */
    public isOrganizationUrl(url: string): boolean {
        const urlSegments = url.slice(1).split(`/`);
        return !urlSegments[0] || Number.isNaN(Number(urlSegments[0]));
    }

    /**
     * Checks if the operator is in a specified meeting
     * @param info a string containing the meetingId of the meeting that is to be checked, or a full url (from which a meetingId can be extracted)
     * @returns the meetingId from the url or (if info is not a url) Number(info), NaN if no number can be extracted
     */
    public getMeetingId(info: string): number {
        const segments = info.split(`/`);
        const meetingIdString = segments.length > 1 ? segments[1] : segments[0];
        return Number(meetingIdString);
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
        if (event.url === `/${UrlTarget.LOGIN}` && this._currentUrl !== event.url) {
            this._nextUrlTargetSubject.next(UrlTarget.LOGIN);
        } else if (event.url === `/` && !!this._currentMeetingId && this.activeMeetingIdService.meetingId === null) {
            this._nextUrlTargetSubject.next(UrlTarget.ORGANIZATION_LAYER);
        }
        this._currentUrl = event.url;
        this._currentMeetingId = this.activeMeetingIdService.meetingId;
    }
}
