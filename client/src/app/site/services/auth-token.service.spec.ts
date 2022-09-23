import { TestBed } from '@angular/core/testing';

import { AuthTokenService } from './auth-token.service';

xdescribe(`AuthTokenService`, () => {
    let service: AuthTokenService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthTokenService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
