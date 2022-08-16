import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollDetailContentComponent } from './assignment-poll-detail-content.component';

xdescribe(`AssignmentPollDetailContentComponent`, () => {
    let component: AssignmentPollDetailContentComponent;
    let fixture: ComponentFixture<AssignmentPollDetailContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollDetailContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollDetailContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
