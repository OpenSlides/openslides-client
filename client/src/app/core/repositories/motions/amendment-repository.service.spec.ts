import { TestBed } from '@angular/core/testing';

import { AmendmentRepositoryService } from './amendment-repository.service';

describe('AmendmentRepositoryService', () => {
    let service: AmendmentRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
