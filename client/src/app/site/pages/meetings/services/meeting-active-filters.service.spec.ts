import { TestBed } from '@angular/core/testing';

import { MeetingActiveFiltersService } from './meeting-active-filters.service';

xdescribe(`MeetingActiveFiltersService`, () => {
    let service: MeetingActiveFiltersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingActiveFiltersService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
