import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollComponent } from './assignment-poll.component';

xdescribe(`AssignmentPollComponent`, () => {
    let component: AssignmentPollComponent;
    let fixture: ComponentFixture<AssignmentPollComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
