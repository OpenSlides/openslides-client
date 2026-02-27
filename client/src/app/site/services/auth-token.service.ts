import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthToken } from '../../domain/interfaces/auth-token';

@Injectable({
    providedIn: `root`
})
export class AuthTokenService {
    public get rawAccessToken(): string | null {
        return this._rawAccessToken;
    }

    public get accessTokenObservable(): Observable<AuthToken | null> {
        return this._accessTokenSubject;
    }

    public get accessToken(): AuthToken | null {
        return this._accessTokenSubject.getValue();
    }

    /**
     * In OIDC mode, the user ID comes from the response body, not from a JWT.
     * This property tracks the OIDC user ID separately.
     */
    public get oidcUserId(): number | null {
        return this._oidcUserId;
    }

    /**
     * Returns true if the user is authenticated (either via JWT or OIDC).
     */
    public get isAuthenticated(): boolean {
        return !!this.accessToken || !!this._oidcUserId;
    }

    /**
     * Check if the current session is an OIDC session by looking for the
     * Traefik OIDC plugin session cookie.
     */
    public static isOidcSession(): boolean {
        return document.cookie.includes(`TraefikOidcAuth.Session`);
    }

    // Use undefined as the state of not being initialized
    private _accessTokenSubject = new BehaviorSubject<AuthToken | null>(null);
    private _rawAccessToken: string | null = null;
    private _oidcUserId: number | null = null;

    public setRawAccessToken(rawToken: string | null): void {
        this._rawAccessToken = rawToken;
        const token = this.parseToken(rawToken);
        this._accessTokenSubject.next(token);
        // Clear OIDC user ID when setting a JWT token (legacy auth mode)
        if (rawToken) {
            this._oidcUserId = null;
        }
    }

    /**
     * Set the user ID for OIDC mode (no JWT token).
     */
    public setOidcUserId(userId: number | null): void {
        this._oidcUserId = userId;
        // Clear JWT token when in OIDC mode
        if (userId) {
            this._rawAccessToken = null;
            this._accessTokenSubject.next(null);
        }
    }

    private parseToken(rawToken: string | null): AuthToken | null {
        if (!rawToken) {
            return null;
        }

        try {
            const payload = atob(rawToken.split(`.`)[1]);
            return JSON.parse(payload) as AuthToken;
        } catch (e) {
            return null;
        }
    }
}
