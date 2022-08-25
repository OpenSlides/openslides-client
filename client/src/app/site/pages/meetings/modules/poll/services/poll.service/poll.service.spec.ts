import { TestBed } from '@angular/core/testing';

import { PollService } from './poll.service';

xdescribe(`PollService`, () => {
    let service: PollService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
