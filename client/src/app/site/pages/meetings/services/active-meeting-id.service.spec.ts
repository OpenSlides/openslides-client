import { TestBed } from '@angular/core/testing';

import { ActiveMeetingIdService } from './active-meeting-id.service';

xdescribe(`ActiveMeetingIdService`, () => {
    let service: ActiveMeetingIdService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActiveMeetingIdService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
