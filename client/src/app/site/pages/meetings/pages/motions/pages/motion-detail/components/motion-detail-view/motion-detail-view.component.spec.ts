import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionDetailViewComponent } from './motion-detail-view.component';

xdescribe(`MotionDetailViewComponent`, () => {
    let component: MotionDetailViewComponent;
    let fixture: ComponentFixture<MotionDetailViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionDetailViewComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
