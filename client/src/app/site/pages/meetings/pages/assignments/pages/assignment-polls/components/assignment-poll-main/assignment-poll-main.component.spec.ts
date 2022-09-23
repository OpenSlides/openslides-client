import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollMainComponent } from './assignment-poll-main.component';

xdescribe(`AssignmentPollMainComponent`, () => {
    let component: AssignmentPollMainComponent;
    let fixture: ComponentFixture<AssignmentPollMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
