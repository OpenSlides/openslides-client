import { TestBed } from '@angular/core/testing';

import { CurrentListOfSpeakersSlideService } from './current-list-of-speakers-slide.service';

describe(`CurrentListOfSpeakersSlideService`, () => {
    let service: CurrentListOfSpeakersSlideService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CurrentListOfSpeakersSlideService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
