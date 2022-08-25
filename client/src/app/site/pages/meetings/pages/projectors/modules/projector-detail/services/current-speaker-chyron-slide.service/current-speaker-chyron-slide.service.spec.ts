import { TestBed } from '@angular/core/testing';

import { CurrentSpeakerChyronSlideService } from './current-speaker-chyron-slide.service';

xdescribe(`CurrentSpeakerChyronSlideService`, () => {
    let service: CurrentSpeakerChyronSlideService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CurrentSpeakerChyronSlideService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
