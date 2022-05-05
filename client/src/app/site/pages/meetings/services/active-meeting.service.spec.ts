import { TestBed } from '@angular/core/testing';

import { ActiveMeetingService } from './active-meeting.service';

describe('ActiveMeetingService', () => {
    let service: ActiveMeetingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActiveMeetingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
