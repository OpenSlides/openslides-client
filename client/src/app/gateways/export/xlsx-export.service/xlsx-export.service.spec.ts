import { TestBed } from '@angular/core/testing';

import { XlsxExportService } from './xlsx-export.service';

xdescribe(`XlsxExportService`, () => {
    let service: XlsxExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(XlsxExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
