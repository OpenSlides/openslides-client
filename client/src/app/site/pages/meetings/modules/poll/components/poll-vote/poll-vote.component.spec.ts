import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollVoteComponent } from './poll-vote.component';

describe('PollVoteComponent', () => {
    let component: PollVoteComponent;
    let fixture: ComponentFixture<PollVoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PollVoteComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollVoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
