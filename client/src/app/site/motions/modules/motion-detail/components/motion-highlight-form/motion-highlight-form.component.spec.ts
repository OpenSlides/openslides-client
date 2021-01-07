import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionHighlightFormComponent } from './motion-highlight-form.component';

describe('MotionHighlightFormComponent', () => {
    let component: MotionHighlightFormComponent;
    let fixture: ComponentFixture<MotionHighlightFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MotionHighlightFormComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionHighlightFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
