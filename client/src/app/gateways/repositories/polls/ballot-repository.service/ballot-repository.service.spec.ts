import { TestBed } from '@angular/core/testing';

import { BallotRepositoryService } from './ballot-repository.service';

xdescribe(`BallotRepositoryService`, () => {
    let service: BallotRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BallotRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
