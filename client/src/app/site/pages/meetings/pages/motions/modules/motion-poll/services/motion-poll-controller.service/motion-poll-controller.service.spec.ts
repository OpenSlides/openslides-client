import { TestBed } from '@angular/core/testing';

import { MotionPollControllerService } from './motion-poll-controller.service';

describe(`MotionPollControllerService`, () => {
    let service: MotionPollControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPollControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
