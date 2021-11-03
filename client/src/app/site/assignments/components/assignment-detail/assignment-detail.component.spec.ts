import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PollProgressComponent } from 'app/site/polls/components/poll-progress/poll-progress.component';
import { E2EImportsModule } from 'e2e-imports.module';

import { AssignmentPollComponent } from '../../modules/assignment-poll/components/assignment-poll/assignment-poll.component';
import { AssignmentPollVoteComponent } from '../../modules/assignment-poll/components/assignment-poll-vote/assignment-poll-vote.component';
import { AssignmentDetailComponent } from './assignment-detail.component';

describe(`AssignmentDetailComponent`, () => {
    let component: AssignmentDetailComponent;
    let fixture: ComponentFixture<AssignmentDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [
                    AssignmentDetailComponent,
                    AssignmentPollComponent,
                    AssignmentPollVoteComponent,
                    PollProgressComponent
                ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
