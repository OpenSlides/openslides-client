import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionManageSubmittersComponent } from './motion-manage-submitters.component';

xdescribe(`MotionManageSubmittersComponent`, () => {
    let component: MotionManageSubmittersComponent;
    let fixture: ComponentFixture<MotionManageSubmittersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManageSubmittersComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionManageSubmittersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
