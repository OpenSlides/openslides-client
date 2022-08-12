import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionParagraphbasedAmendmentComponent } from './motion-paragraphbased-amendment.component';

xdescribe(`MotionParagraphbasedAmendmentComponent`, () => {
    let component: MotionParagraphbasedAmendmentComponent;
    let fixture: ComponentFixture<MotionParagraphbasedAmendmentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionParagraphbasedAmendmentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionParagraphbasedAmendmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
