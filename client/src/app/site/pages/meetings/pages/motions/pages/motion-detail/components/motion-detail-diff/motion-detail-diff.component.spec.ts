import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionDetailDiffComponent } from './motion-detail-diff.component';

xdescribe(`MotionDetailDiffComponent`, () => {
    let component: MotionDetailDiffComponent;
    let fixture: ComponentFixture<MotionDetailDiffComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionDetailDiffComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionDetailDiffComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
