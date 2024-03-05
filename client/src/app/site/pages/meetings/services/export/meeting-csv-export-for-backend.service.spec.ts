import { TestBed } from '@angular/core/testing';

import { MeetingCsvExportForBackendService } from './meeting-csv-export-for-backend.service';

xdescribe(`MeetingCsvExportForBackendService`, () => {
    let service: MeetingCsvExportForBackendService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingCsvExportForBackendService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
