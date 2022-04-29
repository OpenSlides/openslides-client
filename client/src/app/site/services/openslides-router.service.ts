import { Injectable } from '@angular/core';
import { Router, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, filter, map, Observable, distinctUntilChanged } from 'rxjs';
import { Id } from '../../domain/definitions/key-types';
import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';

const URL_LOGIN_PREFIX = `/login`;

@Injectable({
    providedIn: 'root'
})
export class OpenSlidesRouterService {
    public get currentParamMap(): Observable<{ [paramName: string]: any }> {
        return this._currentParamMap.asObservable();
    }

    private get isAnonymousEnabled(): boolean {
        return this.activeMeeting.guestsEnabled;
    }

    private get activeMeetingId(): Id | null {
        return this.activeMeeting.meetingId;
    }

    private readonly _currentParamMap = new BehaviorSubject<{ [paramName: string]: any }>({});

    public constructor(private activeMeeting: ActiveMeetingService, private router: Router) {
        router.events
            .pipe(
                filter(event => event instanceof RoutesRecognized),
                map((event: any) => {
                    return this.buildParamMap(event.state.root);
                }),
                distinctUntilChanged()
            )
            .subscribe(event => this._currentParamMap.next(event));
    }

    public navigateToLogin(meetingId: Id | null = this.activeMeetingId): void {
        const url = this.router.routerState.snapshot.url;
        const urlFragments = url.split(`/`);

        // First, check if a user is already at the login page
        if (url.startsWith(URL_LOGIN_PREFIX) && url.length >= URL_LOGIN_PREFIX.length) {
            return;
        }

        // Then, check if a user is at any orga-specific route
        // if the first fragment is a number, we are in a meeting
        if (!/\d+/g.test(urlFragments[1]) || !meetingId) {
            this.router.navigate([`/`, `login`]);
            return;
        }
        if (this.isAnonymousEnabled) {
            this.router.navigate([`${meetingId}/`]);
        } else {
            this.router.navigate([meetingId, `login`]);
        }
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
}
