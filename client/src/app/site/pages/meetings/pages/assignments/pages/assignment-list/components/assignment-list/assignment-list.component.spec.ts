import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentListComponent } from './assignment-list.component';

xdescribe(`AssignmentListComponent`, () => {
    let component: AssignmentListComponent;
    let fixture: ComponentFixture<AssignmentListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
