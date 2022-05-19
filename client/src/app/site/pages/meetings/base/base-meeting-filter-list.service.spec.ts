import { TestBed } from '@angular/core/testing';

import { BaseMeetingFilterListService } from './base-meeting-filter-list.service';

describe('BaseMeetingFilterListService', () => {
    let service: BaseMeetingFilterListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BaseMeetingFilterListService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
