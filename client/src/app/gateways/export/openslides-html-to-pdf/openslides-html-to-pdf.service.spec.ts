import { TestBed } from '@angular/core/testing';

import { OpenslidesHtmlToPdfService } from './openslides-html-to-pdf.service';

xdescribe(`OpenslidesHtmlToPdfService`, () => {
    let service: OpenslidesHtmlToPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenslidesHtmlToPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
