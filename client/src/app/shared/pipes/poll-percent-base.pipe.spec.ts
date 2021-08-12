import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { AssignmentPollService } from 'app/site/assignments/modules/assignment-poll/services/assignment-poll.service';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { PollPercentBasePipe } from './poll-percent-base.pipe';

describe('PollPercentBasePipe', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        TestBed.compileComponents();
    });

    it('create an instance', inject(
        [AssignmentPollService, MotionPollService],
        (assignmentPollService: AssignmentPollService, motionPollService: MotionPollService) => {
            const motionPipe = new PollPercentBasePipe(assignmentPollService);
            const assignmentPipe = new PollPercentBasePipe(motionPollService);
            expect(motionPipe).toBeTruthy();
            expect(assignmentPipe).toBeTruthy();
        }
    ));
});
