import { TestBed } from '@angular/core/testing';

import { MotionCsvExportService } from './motion-csv-export.service';

describe(`MotionCsvExportService`, () => {
    let service: MotionCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
