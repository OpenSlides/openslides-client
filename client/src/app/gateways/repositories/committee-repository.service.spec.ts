import { TestBed } from '@angular/core/testing';

import { CommitteeRepositoryService } from './committee-repository.service';

describe('CommitteeRepositoryService', () => {
    let service: CommitteeRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
