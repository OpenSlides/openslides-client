import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionSlideComponent } from './motion-slide.component';

xdescribe(`MotionSlideComponent`, () => {
    let component: MotionSlideComponent;
    let fixture: ComponentFixture<MotionSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
