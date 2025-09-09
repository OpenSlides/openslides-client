import { TestBed } from '@angular/core/testing';

import { HistoryEntryRepositoryService } from './history-entry-repository.service';

xdescribe(`HistoryEntryRepositoryService`, () => {
    let service: HistoryEntryRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistoryEntryRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
