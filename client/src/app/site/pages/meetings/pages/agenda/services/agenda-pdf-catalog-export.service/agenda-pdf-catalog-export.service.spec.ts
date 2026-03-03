import { TestBed } from '@angular/core/testing';

import { AgendaPdfCatalogExportService } from './agenda-pdf-catalog-export.service';

xdescribe('AgendaPdfCatalogExportService', () => {
    let service: AgendaPdfCatalogExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaPdfCatalogExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
