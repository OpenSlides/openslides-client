import { TestBed } from '@angular/core/testing';

import { StatuteParagraphCsvExportService } from './statute-paragraph-csv-export.service';

describe(`StatuteParagraphCsvExportService`, () => {
    let service: StatuteParagraphCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(StatuteParagraphCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
