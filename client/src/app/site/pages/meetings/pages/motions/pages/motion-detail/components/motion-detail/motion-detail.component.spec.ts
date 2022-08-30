import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionDetailComponent } from './motion-detail.component';

xdescribe(`MotionDetailComponent`, () => {
    let component: MotionDetailComponent;
    let fixture: ComponentFixture<MotionDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
