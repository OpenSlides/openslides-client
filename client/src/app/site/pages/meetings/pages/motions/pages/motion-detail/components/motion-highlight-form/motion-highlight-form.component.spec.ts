import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionHighlightFormComponent } from './motion-highlight-form.component';

xdescribe(`MotionHighlightFormComponent`, () => {
    let component: MotionHighlightFormComponent;
    let fixture: ComponentFixture<MotionHighlightFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionHighlightFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionHighlightFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
