import { TestBed } from '@angular/core/testing';

import { AuthToken } from '../../domain/interfaces/auth-token';
import { AuthTokenService } from './auth-token.service';

describe(`AuthTokenService`, () => {
    let service: AuthTokenService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [AuthTokenService] });
        service = TestBed.inject(AuthTokenService);
    });

    it(`should be created with empty token`, () => {
        expect(service).toBeTruthy();
        expect(service.rawAccessToken).toBe(null);
        expect(service.accessToken).toBe(null);
    });

    it(`check observable`, () => {
        const token: AuthToken = { expiresAt: new Date(), userId: 1, sessionId: `test`, iat: 5, exp: 12 };
        let test_token: AuthToken | null;
        const raw_token = `UNKNOWN.` + btoa(JSON.stringify(token));
        service.accessTokenObservable.subscribe(v => (test_token = v));
        service.setRawAccessToken(raw_token);
        expect(JSON.stringify(test_token)).toEqual(JSON.stringify(token));
    });

    it(`set accessToken with setRawAccessToken`, () => {
        const token = { expiresAt: new Date(), userId: 1, sessionId: `test`, iat: 5, exp: 12 };
        const raw_token = `UNKNOWN.` + btoa(JSON.stringify(token));
        service.setRawAccessToken(raw_token);
        expect(service.rawAccessToken).toBe(raw_token);
        expect(JSON.stringify(service.accessToken)).toEqual(JSON.stringify(token));
    });

    it(`set empty access token with setRawAccessToken`, () => {
        const token = { expiresAt: new Date(), userId: 1, sessionId: `test`, iat: 5, exp: 12 };
        const raw_token = `UNKNOWN.` + btoa(JSON.stringify(token));
        service.setRawAccessToken(raw_token);
        expect(service.accessToken.userId).toBe(token.userId);
        service.setRawAccessToken(null);
        expect(service.accessToken).toBe(null);
    });
});
