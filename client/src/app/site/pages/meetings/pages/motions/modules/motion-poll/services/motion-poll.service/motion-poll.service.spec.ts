import { TestBed } from '@angular/core/testing';

import { MotionPollService } from './motion-poll.service';

describe('MotionPollService', () => {
    let service: MotionPollService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPollService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
