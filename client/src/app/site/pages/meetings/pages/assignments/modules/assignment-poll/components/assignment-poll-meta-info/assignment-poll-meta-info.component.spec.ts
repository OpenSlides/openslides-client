import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollMetaInfoComponent } from './assignment-poll-meta-info.component';

xdescribe(`AssignmentPollMetaInfoComponent`, () => {
    let component: AssignmentPollMetaInfoComponent;
    let fixture: ComponentFixture<AssignmentPollMetaInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollMetaInfoComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollMetaInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
