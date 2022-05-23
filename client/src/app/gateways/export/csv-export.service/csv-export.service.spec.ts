import { TestBed } from '@angular/core/testing';

import { CsvExportService } from './csv-export.service';

describe(`CsvExportService`, () => {
    let service: CsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
