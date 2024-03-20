import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollCannotVoteMessageComponent } from './poll-cannot-vote-message.component';

xdescribe(`PollCannotVoteMessageComponent`, () => {
    let component: PollCannotVoteMessageComponent;
    let fixture: ComponentFixture<PollCannotVoteMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PollCannotVoteMessageComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PollCannotVoteMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
