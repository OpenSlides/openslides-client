import { TestBed } from '@angular/core/testing';

import { MotionPdfCatalogService } from './motion-pdf-catalog.service';

describe('MotionPdfCatalogService', () => {
    let service: MotionPdfCatalogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPdfCatalogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
