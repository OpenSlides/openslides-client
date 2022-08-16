import { TestBed } from '@angular/core/testing';

import { ExportMeetingPresenterService } from './export-meeting-presenter.service';

xdescribe(`ExportMeetingPresenterService`, () => {
    let service: ExportMeetingPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportMeetingPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
