import { TestBed } from '@angular/core/testing';

import { SpeakerCsvExportService } from './speaker-csv-export.service';

xdescribe(`ParticipantCsvExportService`, () => {
    let service: SpeakerCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeakerCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
