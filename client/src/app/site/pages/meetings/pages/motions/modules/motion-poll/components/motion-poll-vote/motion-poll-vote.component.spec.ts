import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollVoteComponent } from './motion-poll-vote.component';

xdescribe(`MotionPollVoteComponent`, () => {
    let component: MotionPollVoteComponent;
    let fixture: ComponentFixture<MotionPollVoteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollVoteComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollVoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
