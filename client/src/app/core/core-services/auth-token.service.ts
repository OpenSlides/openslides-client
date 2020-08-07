import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthToken {
    expiresAt: Date;
    userId: number;
    sessionId: string;
    iat: number;
    exp: number;
}

/**
 * Authenticates an OpenSlides user with username and password
 */
@Injectable({
    providedIn: 'root'
})
export class AuthTokenService {
    private _rawAccessToken: string | null = null;
    public get rawAccessToken(): string | null {
        return this._rawAccessToken;
    }

    private accessTokenSubject = new BehaviorSubject<AuthToken | null>(null);

    public get accessTokenObservable(): Observable<AuthToken | null> {
        return this.accessTokenSubject.asObservable();
    }

    public get accessToken(): AuthToken | null {
        return this.accessTokenSubject.getValue();
    }

    public setRawAccessToken(rawToken?: string): void {
        this._rawAccessToken = rawToken;
        const token = this.parseToken(rawToken);
        if (!token) {
            this._rawAccessToken = null;
        }

        this.accessTokenSubject.next(token);
    }

    /**
     * Only for test purposes
     */
    public resetAccessTokenToExpired(): void {
        this.setRawAccessToken(
            'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                'eyJleHBpcmVzSW4iOiIxMG0iLCJzZXNzaW9uSWQiOiI2NjUzYWMwNmJhNjVkYmQzNDE5NTQwOGQ1MDI5NjU1ZSIsIn' +
                'VzZXJJZCI6MSwiaWF0IjoxNTk3MTQ5NDI0LCJleHAiOjE1OTcxNTAwMjR9.' +
                'z21-bSIj_xZAoCbwXTqqf_ODAIEbbeSehYIE33dmYUs'
        );
    }

    public resetAccessTokenToInvalid(): void {
        this.setRawAccessToken(
            'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                'eyJleHBpcmVzSW4iOiIxMG0iLCJzZXNzaW9uSWQiOiI2NjUzYWMwNmJhNjVkYmQzNDE5NTQwOGQ1MDI5NjU1ZSIsIn' +
                'VzZXJJZCI6MSwiaWF0IjoxNTk3MTQ5NDI0LCJleHAiOjE1OTcxNTAwMjR9.' +
                'z21-bSIj_xZAoCbwXTqqf_ODAIEbbeSehYIE33YUs'
        );
    }

    public resetAccessTokenToNull(): void {
        this.setRawAccessToken(null);
    }
    /**
     * End of test purposes
     */

    private parseToken(rawToken?: string): AuthToken | null {
        if (!rawToken) {
            return null;
        }

        try {
            const payload = atob(rawToken.split('.')[1]);
            return JSON.parse(payload) as AuthToken;
        } catch (e) {
            return null;
        }
    }
}
