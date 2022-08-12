import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { ExportServiceModule } from '../export-service.module';
import { HtmlToPdfService } from './html-to-pdf.service';

xdescribe(`HtmlToPdfService`, () => {
    let service: HtmlToPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule, ExportServiceModule]
        });
        service = TestBed.inject(HtmlToPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
