import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionContentComponent } from './motion-content.component';

xdescribe(`MotionContentComponent`, () => {
    let component: MotionContentComponent;
    let fixture: ComponentFixture<MotionContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
