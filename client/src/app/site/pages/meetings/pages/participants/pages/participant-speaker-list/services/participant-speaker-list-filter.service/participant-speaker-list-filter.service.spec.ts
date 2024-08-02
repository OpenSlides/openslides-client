import { TestBed } from '@angular/core/testing';

import { ParticipantSpeakerListFilterService } from './participant-speaker-list-filter.service';

xdescribe(`ParticipantSpeakerListFilterService`, () => {
    let service: ParticipantSpeakerListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantSpeakerListFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
