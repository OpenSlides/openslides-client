import { TestBed } from '@angular/core/testing';

import { ParticipantListFilterService } from './participant-list-filter.service';

xdescribe(`ParticipantListFilterService`, () => {
    let service: ParticipantListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantListFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
