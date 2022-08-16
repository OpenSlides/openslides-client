import { TestBed } from '@angular/core/testing';

import { MeetingSettingDirective } from './meeting-setting.directive';

xdescribe(`MeetingSettingDirective`, () => {
    let directive: MeetingSettingDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(MeetingSettingDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
