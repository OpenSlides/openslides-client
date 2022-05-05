import { TestBed } from '@angular/core/testing';

import { ParticipantPdfExportService } from './participant-pdf-export.service';

describe('ParticipantPdfExportService', () => {
    let service: ParticipantPdfExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantPdfExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
