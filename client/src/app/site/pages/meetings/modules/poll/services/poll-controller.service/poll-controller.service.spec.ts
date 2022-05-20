import { TestBed } from '@angular/core/testing';

import { PollControllerService } from './poll-controller.service';

describe(`PollControllerService`, () => {
    let service: PollControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
