import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionListComponent } from './motion-list.component';

xdescribe(`MotionListComponent`, () => {
    let component: MotionListComponent;
    let fixture: ComponentFixture<MotionListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
