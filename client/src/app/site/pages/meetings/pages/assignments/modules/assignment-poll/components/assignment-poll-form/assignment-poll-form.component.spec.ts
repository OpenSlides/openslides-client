import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollFormComponent } from './assignment-poll-form.component';

xdescribe(`AssignmentPollFormComponent`, () => {
    let component: AssignmentPollFormComponent;
    let fixture: ComponentFixture<AssignmentPollFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
