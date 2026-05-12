import { TestBed } from '@angular/core/testing';

import { PollBallotControllerService } from './poll-ballot-controller.service';

xdescribe(`VoteControllerService`, () => {
    let service: PollBallotControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollBallotControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
