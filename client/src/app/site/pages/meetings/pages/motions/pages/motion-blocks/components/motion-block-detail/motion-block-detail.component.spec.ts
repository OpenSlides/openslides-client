import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionBlockDetailComponent } from './motion-block-detail.component';

xdescribe(`MotionBlockDetailComponent`, () => {
    let component: MotionBlockDetailComponent;
    let fixture: ComponentFixture<MotionBlockDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionBlockDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionBlockDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
