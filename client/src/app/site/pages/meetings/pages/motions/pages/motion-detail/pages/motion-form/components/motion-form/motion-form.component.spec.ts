import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionFormComponent } from './motion-form.component';

xdescribe(`MotionDetailFormComponent`, () => {
    let component: MotionFormComponent;
    let fixture: ComponentFixture<MotionFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
