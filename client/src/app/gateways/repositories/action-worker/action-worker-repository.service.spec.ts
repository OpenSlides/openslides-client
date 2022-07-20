import { TestBed } from '@angular/core/testing';

import { ActionWorkerRepositoryService } from './action-worker-repository.service';

describe(`ActionWorkerRepositoryService`, () => {
    let service: ActionWorkerRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActionWorkerRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
