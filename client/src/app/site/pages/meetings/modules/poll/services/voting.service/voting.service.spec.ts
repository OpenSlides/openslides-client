import { TestBed } from '@angular/core/testing';

import { VotingService } from './voting.service';

describe(`VotingService`, () => {
    let service: VotingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VotingService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
