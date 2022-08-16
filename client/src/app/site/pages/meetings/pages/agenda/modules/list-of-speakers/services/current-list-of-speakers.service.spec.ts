import { TestBed } from '@angular/core/testing';

import { CurrentListOfSpeakersService } from './current-list-of-speakers.service';

xdescribe(`CurrentListOfSpeakersService`, () => {
    let service: CurrentListOfSpeakersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CurrentListOfSpeakersService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
