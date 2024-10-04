import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageTimestampComponent } from './motion-manage-timestamp.component';

xdescribe(`MotionManageTimestampComponent`, () => {
    let component: MotionManageTimestampComponent;
    let fixture: ComponentFixture<MotionManageTimestampComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MotionManageTimestampComponent]
        });
        fixture = TestBed.createComponent(MotionManageTimestampComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
