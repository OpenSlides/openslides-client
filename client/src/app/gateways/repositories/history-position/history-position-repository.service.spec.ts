import { TestBed } from '@angular/core/testing';

import { HistoryPositionRepositoryService } from './history-position-repository.service';

xdescribe(`HistoryPositionRepositoryService`, () => {
    let service: HistoryPositionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistoryPositionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
