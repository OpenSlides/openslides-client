import { TestBed } from '@angular/core/testing';

import { CsvExportForBackendService } from './csv-export-for-backend.service';

xdescribe(`CsvExportForBackendService`, () => {
    let service: CsvExportForBackendService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CsvExportForBackendService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
