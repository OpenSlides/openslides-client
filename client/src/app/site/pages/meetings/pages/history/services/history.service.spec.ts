import { TestBed } from '@angular/core/testing';

import { HistoryService } from './history.service';

xdescribe(`HistoryService`, () => {
    let service: HistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
