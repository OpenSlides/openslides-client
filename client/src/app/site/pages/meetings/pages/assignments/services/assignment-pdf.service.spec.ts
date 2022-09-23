import { TestBed } from '@angular/core/testing';

import { AssignmentPdfService } from './assignment-pdf.service';

xdescribe(`AssignmentPdfService`, () => {
    let service: AssignmentPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
