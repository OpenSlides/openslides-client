import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollVoteRatingApprovalComponent } from './poll-vote-rating-approval.component';

describe('PollVoteRatingApprovalComponent', () => {
    let component: PollVoteRatingApprovalComponent;
    let fixture: ComponentFixture<PollVoteRatingApprovalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollVoteRatingApprovalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollVoteRatingApprovalComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
