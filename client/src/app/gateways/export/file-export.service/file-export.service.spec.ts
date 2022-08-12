import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';
import { ExportServiceModule } from '../export-service.module';

import { FileExportService } from './file-export.service';

xdescribe(`FileExportService`, () => {
    let service: FileExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                E2EImportsModule,
                ExportServiceModule
            ]
        });
        service = TestBed.inject(FileExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
