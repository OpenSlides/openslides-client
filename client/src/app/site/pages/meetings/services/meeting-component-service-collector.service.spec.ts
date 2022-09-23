import { TestBed } from '@angular/core/testing';

import { MeetingComponentServiceCollectorService } from './meeting-component-service-collector.service';

xdescribe(`MeetingComponentServiceCollectorService`, () => {
    let service: MeetingComponentServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingComponentServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
