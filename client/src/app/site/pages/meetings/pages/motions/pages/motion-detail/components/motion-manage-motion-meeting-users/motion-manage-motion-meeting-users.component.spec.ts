import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageMotionMeetingUsersComponent } from './motion-manage-motion-meeting-users.component';

xdescribe(`MotionManageSubmittersComponent`, () => {
    let component: MotionManageMotionMeetingUsersComponent;
    let fixture: ComponentFixture<MotionManageMotionMeetingUsersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManageMotionMeetingUsersComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageMotionMeetingUsersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
