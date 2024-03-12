import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { MotionManageMotionMeetingUsersComponent } from './motion-manage-motion-meeting-users.component';

xdescribe(`MotionManageSubmittersComponent`, () => {
    let component: MotionManageMotionMeetingUsersComponent<BaseHasMeetingUserViewModel, BaseModel>;
    let fixture: ComponentFixture<MotionManageMotionMeetingUsersComponent<BaseHasMeetingUserViewModel, BaseModel>>;

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
