import { TestBed } from '@angular/core/testing';

import { CheckDatabasePresenterService } from './check-database-presenter.service';

xdescribe(`CheckDatabasePresenterService`, () => {
    let service: CheckDatabasePresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CheckDatabasePresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
