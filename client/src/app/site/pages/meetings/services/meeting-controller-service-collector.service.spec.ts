import { TestBed } from '@angular/core/testing';

import { MeetingControllerServiceCollectorService } from './meeting-controller-service-collector.service';

xdescribe(`MeetingControllerServiceCollectorService`, () => {
    let service: MeetingControllerServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingControllerServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
