import { TestBed } from '@angular/core/testing';

import { MotionPdfService } from './motion-pdf.service';

describe('MotionPdfService', () => {
    let service: MotionPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPdfService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
