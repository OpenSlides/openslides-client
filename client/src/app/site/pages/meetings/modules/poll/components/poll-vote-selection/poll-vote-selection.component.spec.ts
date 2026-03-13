import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollVoteSelectionComponent } from './poll-vote-selection.component';

describe('PollVoteSelectionComponent', () => {
    let component: PollVoteSelectionComponent;
    let fixture: ComponentFixture<PollVoteSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollVoteSelectionComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollVoteSelectionComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
