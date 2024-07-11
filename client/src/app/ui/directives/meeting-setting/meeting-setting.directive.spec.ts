import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { MeetingSettingDirective } from './meeting-setting.directive';

class MockMeetingSettingsService {
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    public get<T extends keyof Settings>(key: T): Observable<Settings[T]> {
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(undefined);
        }
        return this.settingSubjects[key] as Observable<Settings[T]>;
    }

    public setMockSettings(settings: Partial<Settings>): void {
        for (const key of Object.keys(settings)) {
            if (this.settingSubjects[key]) {
                this.settingSubjects[key].next(settings[key]);
            } else {
                this.settingSubjects[key] = new BehaviorSubject<any>(settings[key]);
            }
        }
    }
}

@Component({
    template: `
        <div id="normal" *osMeetingSetting="setting"></div>
        <div id="and" *osMeetingSetting="setting; and: and"></div>
        <ng-container *osMeetingSetting="setting; then thenTemplate; else elseTemplate"></ng-container>
        <ng-template #thenTemplate>
            <div id="then"></div>
        </ng-template>
        <ng-template #elseTemplate>
            <div id="else"></div>
        </ng-template>
    `
})
class TestComponent {
    public and = true;
    public setting: keyof Settings = `applause_enable`;
}

describe(`MeetingSettingDirective`, () => {
    let fixture: ComponentFixture<TestComponent>;
    let meetingSettingsService: MockMeetingSettingsService;
    const update = () => {
        fixture.detectChanges();
        jasmine.clock().tick(100000);
    };
    const getElement = (css: string) => fixture.debugElement.query(By.css(css));

    beforeEach(() => {
        jasmine.clock().install();
        fixture = TestBed.configureTestingModule({
            declarations: [MeetingSettingDirective, TestComponent],
            providers: [
                MeetingSettingDirective,
                { provide: MeetingSettingsService, useClass: MockMeetingSettingsService }
            ]
        }).createComponent(TestComponent);

        meetingSettingsService = TestBed.inject(MeetingSettingsService) as unknown as MockMeetingSettingsService;
        update();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`check if element gets restricted`, async () => {
        expect(getElement(`#normal`)).toBeFalsy();
        meetingSettingsService.setMockSettings({ applause_enable: true });
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        meetingSettingsService.setMockSettings({ applause_enable: false });
        update();
        expect(getElement(`#normal`)).toBeFalsy();
    });

    it(`check if and condition works`, async () => {
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.and = false;
        update();
        expect(getElement(`#and`)).toBeFalsy();
        meetingSettingsService.setMockSettings({ applause_enable: true });
        update();
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.and = true;
        update();
        expect(getElement(`#and`)).toBeTruthy();
        fixture.componentInstance.setting = `list_of_speakers_initially_closed`;
        update();
        expect(getElement(`#and`)).toBeFalsy();
    });

    it(`check if then and else work`, async () => {
        expect(getElement(`#else`)).toBeTruthy();
        expect(getElement(`#then`)).toBeFalsy();
        meetingSettingsService.setMockSettings({ applause_enable: true });
        update();
        expect(getElement(`#else`)).toBeFalsy();
        expect(getElement(`#then`)).toBeTruthy();
    });
});
