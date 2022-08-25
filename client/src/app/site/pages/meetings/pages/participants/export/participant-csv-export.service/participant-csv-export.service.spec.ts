import { TestBed } from '@angular/core/testing';

import { ParticipantCsvExportService } from './participant-csv-export.service';

xdescribe(`ParticipantCsvExportService`, () => {
    let service: ParticipantCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
