import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionBlockSlideComponent } from './motion-block-slide.component';

xdescribe(`MotionBlockSlideComponent`, () => {
    let component: MotionBlockSlideComponent;
    let fixture: ComponentFixture<MotionBlockSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionBlockSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionBlockSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
