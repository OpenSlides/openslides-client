import { TestBed } from '@angular/core/testing';

import { MeetingListFilterService } from './meeting-list-filter.service';

xdescribe(`MeetingListFilterService`, () => {
    let service: MeetingListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingListFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
