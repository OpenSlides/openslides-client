import { TestBed } from '@angular/core/testing';

import { AmendmentControllerService } from './amendment-controller.service';

describe('AmendmentControllerService', () => {
    let service: AmendmentControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
