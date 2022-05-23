import { TestBed } from '@angular/core/testing';

import { ParticipantPdfService } from './participant-pdf.service';

describe(`ParticipantPdfService`, () => {
    let service: ParticipantPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
