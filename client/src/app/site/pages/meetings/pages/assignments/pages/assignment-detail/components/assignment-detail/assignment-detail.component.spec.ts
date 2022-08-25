import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentDetailComponent } from './assignment-detail.component';

xdescribe(`AssignmentDetailComponent`, () => {
    let component: AssignmentDetailComponent;
    let fixture: ComponentFixture<AssignmentDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
