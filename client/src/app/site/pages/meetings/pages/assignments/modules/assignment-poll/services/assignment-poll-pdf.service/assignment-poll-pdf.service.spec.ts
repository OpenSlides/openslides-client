import { TestBed } from '@angular/core/testing';

import { AssignmentPollPdfService } from './assignment-poll-pdf.service';

xdescribe(`AssignmentPollPdfService`, () => {
    let service: AssignmentPollPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentPollPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
