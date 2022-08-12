import { TestBed } from '@angular/core/testing';

import { ParticipantControllerService } from './participant-controller.service';

xdescribe(`ParticipantControllerService`, () => {
    let service: ParticipantControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
