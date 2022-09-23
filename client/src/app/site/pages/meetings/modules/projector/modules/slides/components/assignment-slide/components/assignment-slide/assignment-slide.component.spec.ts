import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentSlideComponent } from './assignment-slide.component';

xdescribe(`AssignmentSlideComponent`, () => {
    let component: AssignmentSlideComponent;
    let fixture: ComponentFixture<AssignmentSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
