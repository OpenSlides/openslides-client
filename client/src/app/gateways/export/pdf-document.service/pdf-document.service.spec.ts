import { TestBed } from '@angular/core/testing';

import { PdfDocumentService } from './pdf-document.service';

xdescribe(`PdfDocumentService`, () => {
    let service: PdfDocumentService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PdfDocumentService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
