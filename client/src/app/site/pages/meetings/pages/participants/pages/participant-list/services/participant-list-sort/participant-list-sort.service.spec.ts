import { TestBed } from '@angular/core/testing';

import { ParticipantListSortService } from './participant-list-sort.service';

xdescribe(`ParticipantListSortService`, () => {
    let service: ParticipantListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
