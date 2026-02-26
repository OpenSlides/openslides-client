import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollApprovalVoteComponent } from './poll-approval-vote.component';

describe('PollApprovalVoteComponent', () => {
    let component: PollApprovalVoteComponent;
    let fixture: ComponentFixture<PollApprovalVoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollApprovalVoteComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollApprovalVoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
