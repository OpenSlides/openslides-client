import { TestBed } from '@angular/core/testing';

import { AmendmentService } from './amendment.service';

describe('AmendmentService', () => {
    let service: AmendmentService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
