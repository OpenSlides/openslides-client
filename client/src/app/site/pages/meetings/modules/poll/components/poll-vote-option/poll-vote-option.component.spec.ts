import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollVoteOptionComponent } from './poll-vote-option.component';

describe('PollVoteOptionComponent', () => {
    let component: PollVoteOptionComponent;
    let fixture: ComponentFixture<PollVoteOptionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollVoteOptionComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollVoteOptionComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
