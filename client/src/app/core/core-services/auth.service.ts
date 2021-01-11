import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

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

    /**
     * An observable to wait for the first time `who-am-i` is called.
     * Necessary to wait until an accesstoken is received or not.
     */
    public get firstTimeWhoAmI(): Observable<boolean> {
        return this.firstTimeWhoAmISubject.asObservable();
    }

    public get authTokenObservable(): Observable<AuthToken | null> {
        return this.authTokenService.accessTokenObservable;
    }

    public get authToken(): AuthToken | null {
        return this.authTokenService.accessToken;
    }

    private firstTimeWhoAmISubject = new BehaviorSubject<boolean>(false);

    public constructor(
        private http: HttpService,
        private lifecycleService: LifecycleService,
        private router: Router,
        private authTokenService: AuthTokenService
    ) {}

    public async login(username: string, password: string): Promise<void> {
        const user = {
            username: username,
            password: password
        };
        const response = await this.http.post<LoginResponse>(`${environment.authUrlPrefix}/login/`, user);
        if (response.success) {
            this.lifecycleService.reboot();
            await this.redirectUser();
        }
    }

    public async redirectUser(): Promise<void> {
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
        this.router.navigate(['/']);
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
            this.whoAmIRequestFinished();
            return true;
        } catch (e) {
            this.whoAmIRequestFinished();
            return false;
        }
    }

    private whoAmIRequestFinished(): void {
        this.firstTimeWhoAmISubject.next(true);
        this.firstTimeWhoAmISubject.complete();
    }
}
