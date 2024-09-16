import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionCommentsComponent } from './motion-comments.component';

xdescribe(`MotionCommentsComponent`, () => {
    let component: MotionCommentsComponent;
    let fixture: ComponentFixture<MotionCommentsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionCommentsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionCommentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
