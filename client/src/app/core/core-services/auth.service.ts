import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AuthToken, AuthTokenService } from './auth-token.service';
import { HttpService } from './http.service';
import { LifecycleService } from './lifecycle.service';

/**
 * Response from a login request.
 */
export interface LoginResponse {
    message: string;
    success: boolean;
    token?: string;
}

interface LoginData {
    username: string;
    password: string;
    cookies?: boolean;
}

/**
 * Authenticates an OpenSlides user with username and password
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /**
     * If the user tries to access a certain URL without being authenticated, the URL will be stored here
     */
    public redirectUrl: string;

    // This is a wrapper around authTokenService.accessTokenObservable
    // We need to control the point, when specific token changes should be propagated
    private authTokenSubject = new BehaviorSubject<AuthToken | null>(null);
    private authTokenSubscription: Subscription | null = null;

    public get authTokenObservable(): Observable<AuthToken | null> {
        return this.authTokenSubject.asObservable();
    }

    public get authToken(): AuthToken | null {
        return this.authTokenSubject.getValue();
    }

    /**
     * "Pings" every time when a user logs out.
     */
    public readonly onLogout = new EventEmitter<void>();

    public constructor(
        private http: HttpService,
        private lifecycleService: LifecycleService,
        private router: Router,
        private authTokenService: AuthTokenService
    ) {
        this.resumeTokenSubscription();
    }

    public async login(username: string, password: string): Promise<void> {
        const user = {
            username: username,
            password: password
        };
        this.holdBackTokenSubscription();
        try {
            const response = await this.http.post<LoginResponse>(`${environment.authUrlPrefix}/login/`, user);
            if (response.success) {
                // Shutdowning kills all connections. The operator is listening for token changes, so
                // we must hold them back to this point.
                this.lifecycleService.shutdown();
                this.lifecycleService.bootup();
                this.resumeTokenSubscription();
                this.redirectUser();
            }
        } catch (e) {
            throw e;
        } finally {
            // in error cases, resume the subscription
            if (!this.authTokenSubscription) {
                this.resumeTokenSubscription();
            }
        }
    }

    public redirectUser(): void {
        let redirect = this.redirectUrl ? this.redirectUrl : '/';

        const excludedUrls = ['login'];
        if (excludedUrls.some(url => redirect.includes(url))) {
            redirect = '/';
        }
        this.router.navigate([redirect]);
    }

    public async logout(): Promise<void> {
        this.lifecycleService.shutdown();
        const response = await this.http.post<LoginResponse>(
            `${environment.authUrlPrefix}${environment.authSecurePrefix}/logout/`
        );
        if (response.success) {
            this.authTokenService.setRawAccessToken(null);
        }
        this.onLogout.emit();
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
        try {
            await this.http.post<LoginResponse>(`${environment.authUrlPrefix}/who-am-i/`);
            return true;
        } catch (e) {
            return false;
        }
    }

    private resumeTokenSubscription(): void {
        if (this.authTokenSubscription) {
            console.error('The token subscription is already running');
            return;
        }
        this.authTokenSubscription = this.authTokenService.accessTokenObservable.subscribe(token =>
            this.authTokenSubject.next(token)
        );
    }

    private holdBackTokenSubscription(): void {
        if (!this.authTokenSubscription) {
            console.error('The token subscription is already stopped');
            return;
        }
        this.authTokenSubscription.unsubscribe();
        this.authTokenSubscription = null;
    }
}
