import { TestBed } from '@angular/core/testing';

import { AuthAdapterService } from './auth-adapter.service';

describe(`AuthAdapterService`, () => {
    let service: AuthAdapterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthAdapterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
