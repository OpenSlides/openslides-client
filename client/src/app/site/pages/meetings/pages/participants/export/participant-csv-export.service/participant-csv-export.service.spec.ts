import { TestBed } from '@angular/core/testing';

import { ParticipantCsvExportService } from './participant-csv-export.service';

describe(`ParticipantCsvExportService`, () => {
    let service: ParticipantCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
