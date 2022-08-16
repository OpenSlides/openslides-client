import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentMainComponent } from './assignment-main.component';

xdescribe(`AssignmentMainComponent`, () => {
    let component: AssignmentMainComponent;
    let fixture: ComponentFixture<AssignmentMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
