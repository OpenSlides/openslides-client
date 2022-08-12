import { TestBed } from '@angular/core/testing';

import { VoteRepositoryService } from './vote-repository.service';

xdescribe(`VoteRepositoryService`, () => {
    let service: VoteRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VoteRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
