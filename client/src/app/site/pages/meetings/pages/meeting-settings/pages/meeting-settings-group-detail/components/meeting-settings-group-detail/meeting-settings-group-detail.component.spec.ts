import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSettingsGroupDetailComponent } from './meeting-settings-group-detail.component';

xdescribe(`MeetingSettingsGroupDetailComponent`, () => {
    let component: MeetingSettingsGroupDetailComponent;
    let fixture: ComponentFixture<MeetingSettingsGroupDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingSettingsGroupDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsGroupDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
