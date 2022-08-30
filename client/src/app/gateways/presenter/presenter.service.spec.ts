import { TestBed } from '@angular/core/testing';

import { PresenterService } from './presenter.service';

xdescribe(`PresenterService`, () => {
    let service: PresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
