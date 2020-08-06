import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from 'environments/environment';

import { HttpService } from './http.service';
import { AuthTokenService, AuthToken } from './auth-token.service';
import { Observable } from 'rxjs';
import { LifecycleService } from './lifecycle.service';

/**
 * Response from a login request.
 */
export interface LoginResponse {
    message: string;
    success: boolean;
    token?: string;
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

    public get authTokenObservable(): Observable<AuthToken | null> {
        return this.authTokenService.accessTokenObservable;
    }

    public get authToken(): AuthToken | null {
        return this.authTokenService.accessToken;
    }

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
        const response = await this.http.post<LoginResponse>(environment.authUrlPrefix + '/login/', user);
        if (response.success) {
            this.authTokenService.setRawAccessToken(response.token);
            await this.lifecycleService.reboot();
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
        const response = await this.http.post<LoginResponse>(environment.authUrlPrefix + '/api/logout/');
        if (response.success) {
            this.authTokenService.setRawAccessToken(null);
        }
        this.router.navigate(['/']);
        await this.lifecycleService.reboot();
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.accessToken;
    }

    /**
     * Calls `/apps/users/whoami` to find out the real operator.
     *
     * @returns true, if the request was successful (=online)
     */
    public async doWhoAmIRequest(): Promise<boolean> {
        try {
            const loginResponse = await this.http.post<LoginResponse>(`${environment.authUrlPrefix}/who-am-i/`);
            this.authTokenService.setRawAccessToken(loginResponse.token);
            return true;
        } catch (e) {
            return false;
        }
    }
}
