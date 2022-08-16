import { TestBed } from '@angular/core/testing';

import { GetUserScopePresenterService } from './get-user-scope-presenter.service';

xdescribe(`GetUserScopePresenterService`, () => {
    let service: GetUserScopePresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GetUserScopePresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
