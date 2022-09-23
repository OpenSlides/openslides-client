import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionCallListComponent } from './motion-call-list.component';

xdescribe(`MotionCallListComponent`, () => {
    let component: MotionCallListComponent;
    let fixture: ComponentFixture<MotionCallListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionCallListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionCallListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
