import { TestBed } from '@angular/core/testing';

import { MeetingCsvExportService } from './meeting-csv-export.service';

xdescribe(`MeetingCsvExportService`, () => {
    let service: MeetingCsvExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingCsvExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
