import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManagePollsComponent } from './motion-manage-polls.component';

xdescribe(`MotionManagePollsComponent`, () => {
    let component: MotionManagePollsComponent;
    let fixture: ComponentFixture<MotionManagePollsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManagePollsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManagePollsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
