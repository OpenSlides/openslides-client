import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPollVoteComponent } from './topic-poll-vote.component';

xdescribe(`TopicPollVoteComponent`, () => {
    let component: TopicPollVoteComponent;
    let fixture: ComponentFixture<TopicPollVoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopicPollVoteComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopicPollVoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
