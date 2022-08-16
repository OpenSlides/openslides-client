import { TestBed } from '@angular/core/testing';

import { MeetingSettingsDefinitionService } from './meeting-settings-definition.service';

xdescribe(`MeetingSettingsDefinitionService`, () => {
    let service: MeetingSettingsDefinitionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingSettingsDefinitionService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
