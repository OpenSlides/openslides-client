import { TestBed } from '@angular/core/testing';

import { MotionHtmlToPdfService } from './motion-html-to-pdf.service';

xdescribe(`MotionHtmlToPdfService`, () => {
    let service: MotionHtmlToPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionHtmlToPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
