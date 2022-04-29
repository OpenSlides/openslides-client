import { TestBed } from '@angular/core/testing';

import { PollListFilterService } from './poll-list-filter.service';

describe('PollListFilterService', () => {
    let service: PollListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollListFilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
