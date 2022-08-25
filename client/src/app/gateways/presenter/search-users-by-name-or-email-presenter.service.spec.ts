import { TestBed } from '@angular/core/testing';

import { SearchUsersByNameOrEmailPresenterService } from './search-users-by-name-or-email-presenter.service';

xdescribe(`SearchUsersByNameOrEmailPresenterService`, () => {
    let service: SearchUsersByNameOrEmailPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SearchUsersByNameOrEmailPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
