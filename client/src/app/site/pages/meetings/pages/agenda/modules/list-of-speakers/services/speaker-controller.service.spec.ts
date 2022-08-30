import { TestBed } from '@angular/core/testing';

import { SpeakerControllerService } from './speaker-controller.service';

xdescribe(`SpeakerControllerService`, () => {
    let service: SpeakerControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeakerControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
