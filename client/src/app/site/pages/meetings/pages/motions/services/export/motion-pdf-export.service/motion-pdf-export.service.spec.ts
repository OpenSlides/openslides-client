import { TestBed } from '@angular/core/testing';

import { MotionPdfExportService } from './motion-pdf-export.service';

xdescribe(`MotionPdfExportService`, () => {
    let service: MotionPdfExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPdfExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
