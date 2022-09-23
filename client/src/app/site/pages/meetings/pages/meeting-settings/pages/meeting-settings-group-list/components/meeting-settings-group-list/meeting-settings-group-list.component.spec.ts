import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingSettingsGroupListComponent } from './meeting-settings-group-list.component';

xdescribe(`MeetingSettingsGroupListComponent`, () => {
    let component: MeetingSettingsGroupListComponent;
    let fixture: ComponentFixture<MeetingSettingsGroupListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MeetingSettingsGroupListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsGroupListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
