import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionFinalVersionComponent } from './motion-final-version.component';

xdescribe(`MotionFinalVersionComponent`, () => {
    let component: MotionFinalVersionComponent;
    let fixture: ComponentFixture<MotionFinalVersionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionFinalVersionComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionFinalVersionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
