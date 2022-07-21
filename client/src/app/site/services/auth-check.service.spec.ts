import { TestBed } from '@angular/core/testing';

import { AuthCheckService } from './auth-check.service';

describe(`AuthCheckService`, () => {
    let service: AuthCheckService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthCheckService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
