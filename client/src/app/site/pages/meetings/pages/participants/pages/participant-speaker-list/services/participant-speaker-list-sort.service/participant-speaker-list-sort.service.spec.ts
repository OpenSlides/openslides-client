import { TestBed } from '@angular/core/testing';

import { ParticipantSpeakerListSortService } from './participant-speaker-list-sort.service';

xdescribe(`ParticipantSpeakerListSortService`, () => {
    let service: ParticipantSpeakerListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantSpeakerListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
