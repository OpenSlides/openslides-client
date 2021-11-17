import { TestBed } from '@angular/core/testing';

import { SendVotesService } from './send-votes.service';

describe(`SendVotesService`, () => {
    let service: SendVotesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SendVotesService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
