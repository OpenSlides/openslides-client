import { TestBed } from '@angular/core/testing';

import { SearchUsersPresenterService } from './search-users-presenter.service';

xdescribe(`SearchUsersPresenterService`, () => {
    let service: SearchUsersPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SearchUsersPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
