import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionMainComponent } from './motion-main.component';

xdescribe(`MotionMainComponent`, () => {
    let component: MotionMainComponent;
    let fixture: ComponentFixture<MotionMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
