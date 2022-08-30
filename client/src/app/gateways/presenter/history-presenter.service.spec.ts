import { TestBed } from '@angular/core/testing';

import { HistoryPresenterService } from './history-presenter.service';

xdescribe(`HistoryPresenterService`, () => {
    let service: HistoryPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistoryPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
