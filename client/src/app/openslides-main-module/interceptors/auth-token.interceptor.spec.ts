import { TestBed } from '@angular/core/testing';

import { AuthTokenInterceptor } from './auth-token.interceptor';

xdescribe(`AuthTokenInterceptor`, () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            providers: [AuthTokenInterceptor]
        })
    );

    it(`should be created`, () => {
        const interceptor: AuthTokenInterceptor = TestBed.inject(AuthTokenInterceptor);
        expect(interceptor).toBeTruthy();
    });
});
