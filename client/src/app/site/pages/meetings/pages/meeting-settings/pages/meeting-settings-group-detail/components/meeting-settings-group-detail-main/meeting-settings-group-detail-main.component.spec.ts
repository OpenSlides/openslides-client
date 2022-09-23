import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSettingsGroupDetailMainComponent } from './meeting-settings-group-detail-main.component';

xdescribe(`MeetingSettingsGroupDetailMainComponent`, () => {
    let component: MeetingSettingsGroupDetailMainComponent;
    let fixture: ComponentFixture<MeetingSettingsGroupDetailMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingSettingsGroupDetailMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsGroupDetailMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
