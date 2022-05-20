import { TestBed } from '@angular/core/testing';

import { SpeakerControllerService } from './speaker-controller.service';

describe(`SpeakerControllerService`, () => {
    let service: SpeakerControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeakerControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
