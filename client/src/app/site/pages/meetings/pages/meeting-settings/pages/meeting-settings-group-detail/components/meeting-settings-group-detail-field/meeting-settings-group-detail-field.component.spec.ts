import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSettingsGroupDetailFieldComponent } from './meeting-settings-group-detail-field.component';

xdescribe(`MeetingSettingsGroupDetailFieldComponent`, () => {
    let component: MeetingSettingsGroupDetailFieldComponent;
    let fixture: ComponentFixture<MeetingSettingsGroupDetailFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingSettingsGroupDetailFieldComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsGroupDetailFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
