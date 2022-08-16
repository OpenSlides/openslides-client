import { TestBed } from '@angular/core/testing';

import { MeetingSettingsService } from './meeting-settings.service';

xdescribe(`MeetingSettingsService`, () => {
    let service: MeetingSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingSettingsService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
