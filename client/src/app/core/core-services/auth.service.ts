import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ProcessError } from '../errors/process-error';
import { AuthToken, AuthTokenService } from './auth-token.service';
import { DataStoreService } from './data-store.service';
import { HttpService } from './http.service';
import { LifecycleService } from './lifecycle.service';

/**
 * Response from a request to the auth service.
 */
export interface AuthServiceResponse {
    message: string;
    success: boolean;
    token?: string;
}

/**
 * Authenticates an OpenSlides user with username and password
 */
@Injectable({
    providedIn: `root`
})
export class AuthService {
    public get authTokenObservable(): Observable<AuthToken | null> {
        return this._authTokenSubject.asObservable();
    }

    public get authToken(): AuthToken | null {
        return this._authTokenSubject.getValue();
    }

    /**
     * "Pings" every time when a user logs out.
     */
    public get logoutObservable(): Observable<void> {
        return this._logoutEvent.asObservable();
    }

    // This is a wrapper around authTokenService.accessTokenObservable
    // We need to control the point, when specific token changes should be propagated.
    // undefined is used to indicate, that there is no valid token yet
    private readonly _authTokenSubject = new BehaviorSubject<AuthToken | null>(undefined);
    private readonly _logoutEvent = new EventEmitter<void>();

    private _authTokenSubscription: Subscription | null = null;
    private _authTokenRefreshTimeout: NodeJS.Timeout | null = null;

    public constructor(
        private http: HttpService,
        private lifecycleService: LifecycleService,
        private router: Router,
        private authTokenService: AuthTokenService,
        private DS: DataStoreService
    ) {
        this.resumeTokenSubscription();
    }

    /**
     * Signs in to OpenSlides. Username and password are not necessary, if a current meeting allows guests.
     * Then, a meeting-id is required.
     *
     * @param username
     * @param password
     * @param meetingId Optional. A meeting-id can be given to signs in to a specific meeting.
     * Required, if anyone signs in as guest.
     */
    public async login(username: string, password: string, meetingId?: number): Promise<void> {
        const user = { username, password };
        this.holdBackTokenSubscription();
        try {
            const response = await this.http.post<AuthServiceResponse>(`${environment.authUrlPrefix}/login/`, user);
            if (response.success) {
                // Shutdowning kills all connections. The operator is listening for token changes, so
                // we must hold them back to this point.
                this.lifecycleService.reboot();
                this.resumeTokenSubscription();
                this.redirectUser(meetingId);
            }
        } catch (e) {
            throw e;
        } finally {
            // in error cases, resume the subscription
            if (!this._authTokenSubscription) {
                this.resumeTokenSubscription();
            }
        }
    }

    public redirectUser(meetingId?: number): void {
        if (this.isAuthenticated()) {
            const baseRoute = meetingId ? `${meetingId}/` : `/`;
            this.router.navigate([baseRoute]);
        }
    }

    public async logout(): Promise<void> {
        this.clearRefreshRoutine();
        this.lifecycleService.shutdown();
        const response = await this.http.post<AuthServiceResponse>(
            `${environment.authUrlPrefix}${environment.authSecurePrefix}/logout/`
        );
        if (response.success) {
            this.authTokenService.setRawAccessToken(null);
        }
        this._logoutEvent.emit();
        await this.DS.clear();
        this.lifecycleService.bootup();
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.accessToken;
    }

    /**
     * Calls `/system/auth/who-am-i` to find out the real operator.
     *
     * @returns true, if the request was successful (=online)
     */
    public async doWhoAmIRequest(): Promise<boolean> {
        console.log(`auth: Do WhoAmI`);
        let online: boolean;
        try {
            await this.http.post<AuthServiceResponse>(`${environment.authUrlPrefix}/who-am-i/`);
            online = true;
        } catch (e) {
            if (e instanceof ProcessError && e.status >= 400 && e.status < 500) {
                online = true;
            } else {
                online = false;
            }
        }
        console.log(`auth: WhoAmI done, online:`, online, `authenticated:`, !!this.authTokenService.accessToken);
        return online;
    }

    private resumeTokenSubscription(): void {
        if (this._authTokenSubscription) {
            console.error(`The token subscription is already running`);
            return;
        }
        this._authTokenSubscription = this.authTokenService.accessTokenObservable.subscribe(token => {
            this._authTokenSubject.next(token);
            this.setupRefreshRoutine();
        });
    }

    private holdBackTokenSubscription(): void {
        if (!this._authTokenSubscription) {
            console.error(`The token subscription is already stopped`);
            return;
        }
        this._authTokenSubscription.unsubscribe();
        this._authTokenSubscription = null;
        this.clearRefreshRoutine();
    }

    private setupRefreshRoutine(): void {
        if (this._authTokenRefreshTimeout) {
            this.clearRefreshRoutine();
        }
        if (!this.authToken) {
            return;
        }
        const issuedAt = new Date().getTime(); // in ms
        const expiresAt = this.authToken.exp; // in sec
        this._authTokenRefreshTimeout = setTimeout(() => {
            this.doWhoAmIRequest();
        }, expiresAt * 1000 - issuedAt - 100); // 100ms before token is invalid
    }

    private clearRefreshRoutine(): void {
        if (!this._authTokenRefreshTimeout) {
            return;
        }
        clearTimeout(this._authTokenRefreshTimeout);
        this._authTokenRefreshTimeout = null;
    }
}
