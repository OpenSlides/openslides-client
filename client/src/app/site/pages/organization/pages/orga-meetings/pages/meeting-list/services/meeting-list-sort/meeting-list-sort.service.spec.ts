import { TestBed } from '@angular/core/testing';

import { MeetingListSortService } from './meeting-list-sort.service';

xdescribe(`MeetingListSortService`, () => {
    let service: MeetingListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
