import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

/**
 * The received token decoded and formatted as JSON.
 */
export interface Token {
    expiresAt: Date;
    username: string;
    userId: number;
    sessionId: string;
    iat: number;
    exp: number;
}

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private accessTokenSubject = new BehaviorSubject<string>('');

    public get accessToken(): string {
        return this.accessTokenSubject.value;
    }

    public nextAccessToken(token: string): void {
        this.accessTokenSubject.next(token);
    }

    public getAccessTokenAsObservable(): Observable<string> {
        return this.accessTokenSubject.asObservable();
    }

    public whoAmI(): Token {
        if (!this.accessToken) {
            return {} as Token;
        }

        try {
            const payload = atob(this.accessToken.split('.')[1]);
            return JSON.parse(payload) as Token;
        } catch (e) {
            return {} as Token;
        }
    }
}
