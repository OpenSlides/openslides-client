import { TestBed } from '@angular/core/testing';

import { AssignmentPollService } from './assignment-poll.service';

xdescribe(`AssignmentPollService`, () => {
    let service: AssignmentPollService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentPollService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
