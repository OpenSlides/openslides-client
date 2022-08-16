import { TestBed } from '@angular/core/testing';

import { PollRepositoryService } from './poll-repository.service';

xdescribe(`PollRepositoryService`, () => {
    let service: PollRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
