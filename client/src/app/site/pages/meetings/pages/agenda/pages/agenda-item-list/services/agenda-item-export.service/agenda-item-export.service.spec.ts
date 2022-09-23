import { TestBed } from '@angular/core/testing';

import { AgendaItemExportService } from './agenda-item-export.service';

xdescribe(`AgendaItemExportService`, () => {
    let service: AgendaItemExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaItemExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
