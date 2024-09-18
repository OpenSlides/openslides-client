import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionCommentComponent } from './motion-comment.component';

xdescribe(`MotionCommentComponent`, () => {
    let component: MotionCommentComponent;
    let fixture: ComponentFixture<MotionCommentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionCommentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionCommentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
