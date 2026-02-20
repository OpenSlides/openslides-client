import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollApprovalFormComponent } from './poll-approval-form.component';

describe('PollApprovalFormComponent', () => {
    let component: PollApprovalFormComponent;
    let fixture: ComponentFixture<PollApprovalFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollApprovalFormComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollApprovalFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
