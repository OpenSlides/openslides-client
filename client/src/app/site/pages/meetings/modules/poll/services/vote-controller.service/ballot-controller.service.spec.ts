import { TestBed } from '@angular/core/testing';

import { BallotControllerService } from './ballot-controller.service';

xdescribe(`VoteControllerService`, () => {
    let service: BallotControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BallotControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
