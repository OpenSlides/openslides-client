import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollResultRatingApprovalComponent } from './poll-result-rating-approval.component';

describe('PollResultRatingApprovalComponent', () => {
    let component: PollResultRatingApprovalComponent;
    let fixture: ComponentFixture<PollResultRatingApprovalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollResultRatingApprovalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollResultRatingApprovalComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
