import { TestBed } from '@angular/core/testing';

import { HtmlToPdfService } from './html-to-pdf.service';

describe(`HtmlToPdfService`, () => {
    let service: HtmlToPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HtmlToPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
