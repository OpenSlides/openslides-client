import { TestBed } from '@angular/core/testing';

import { GetUsersPresenterService } from './get-users-presenter.service';

xdescribe(`GetUsersPresenterService`, () => {
    let service: GetUsersPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GetUsersPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
