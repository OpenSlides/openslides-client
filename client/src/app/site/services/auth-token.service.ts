import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthToken } from '../../domain/interfaces/auth-token';

@Injectable({
    providedIn: `root`
})
export class AuthTokenService {
    /* @deprecated */
    public get rawAccessToken(): string | null {
        return this._rawAccessToken;
    }

    /* @deprecated */
    public get accessTokenObservable(): Observable<AuthToken | null> {
        return this._accessTokenSubject;
    }

    /* @deprecated */
    public get accessToken(): AuthToken | null {
        return this._accessTokenSubject.getValue();
    }

    public get userIdObservable(): Observable<number | null> {
        return this._userIdSubject;
    }

    public get userId(): number | null {
        return this._userIdSubject.getValue();
    }

    // Use undefined as the state of not being initialized
    private _accessTokenSubject = new BehaviorSubject<AuthToken | null>(null);
    private _rawAccessToken: string | null = null;

    private _userIdSubject = new BehaviorSubject<number | null>(null);

    /* @deprecated */
    public setRawAccessToken(rawToken: string | null): void {
        this._rawAccessToken = rawToken;
        const token = this.parseToken(rawToken);
        this._accessTokenSubject.next(token);
    }

    public setUserId(id: number): void {
        if (!id) {
            id = null;
        }

        if (id !== this.userId) {
            this._userIdSubject.next(id);
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
