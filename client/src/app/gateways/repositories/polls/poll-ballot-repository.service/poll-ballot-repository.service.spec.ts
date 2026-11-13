import { TestBed } from '@angular/core/testing';

import { PollBallotRepositoryService } from './poll-ballot-repository.service';

xdescribe(`BallotRepositoryService`, () => {
    let service: PollBallotRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollBallotRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
