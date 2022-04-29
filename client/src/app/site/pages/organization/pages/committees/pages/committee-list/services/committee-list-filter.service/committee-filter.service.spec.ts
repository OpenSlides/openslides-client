import { TestBed } from '@angular/core/testing';

import { CommitteeFilterService } from './committee-filter.service';

describe('CommitteeFilterService', () => {
    let service: CommitteeFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeFilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
