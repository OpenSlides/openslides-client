import { TestBed } from '@angular/core/testing';

import { MeetingControllerServiceCollectroService } from './meeting-controller-service-collectro.service';

describe(`MeetingControllerServiceCollectroService`, () => {
    let service: MeetingControllerServiceCollectroService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingControllerServiceCollectroService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
