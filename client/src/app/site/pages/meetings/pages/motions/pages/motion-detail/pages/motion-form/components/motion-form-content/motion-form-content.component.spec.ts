import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionFormContentComponent } from './motion-form-content.component';

xdescribe(`MotionContentComponent`, () => {
    let component: MotionFormContentComponent;
    let fixture: ComponentFixture<MotionFormContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionFormContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionFormContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
