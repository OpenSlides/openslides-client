import { TestBed } from '@angular/core/testing';

import { MeetingPdfExportService } from './meeting-pdf-export.service';

describe(`MeetingPdfExportService`, () => {
    let service: MeetingPdfExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingPdfExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
