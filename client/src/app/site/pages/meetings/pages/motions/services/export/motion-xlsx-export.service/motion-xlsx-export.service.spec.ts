import { TestBed } from '@angular/core/testing';

import { MotionXlsxExportService } from './motion-xlsx-export.service';

xdescribe(`MotionXlsxExportService`, () => {
    let service: MotionXlsxExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionXlsxExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
