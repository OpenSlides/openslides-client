import { TestBed } from '@angular/core/testing';

import { PointOfOrderDialogService } from './point-of-order-dialog.service';

describe('PointOfOrderDialogService', () => {
    let service: PointOfOrderDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PointOfOrderDialogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
