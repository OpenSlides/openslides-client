import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { ExportServiceModule } from '../export-service.module';
import { CsvExportService } from './csv-export.service';

xdescribe(`CsvExportService`, () => {
    let service: CsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule, ExportServiceModule]
        });
        service = TestBed.inject(CsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
