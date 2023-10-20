import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { Action } from 'src/app/gateways/actions';
import { MotionSubmitterRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { ViewMotion } from '../../../../view-models';
import { ViewMotionSubmitter } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionSubmitterControllerService extends BaseMeetingControllerService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionSubmitterRepositoryService,
        private userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, MotionSubmitter, repo);
    }

    public create(motion: ViewMotion, ...users: Identifiable[]): Action<Identifiable[]> {
        const meetingUsers = users.map(user => this.userRepo.getViewModel(user.id)?.getMeetingUser(motion.meeting_id));
        return this.repo.create(motion, ...meetingUsers);
    }

    public delete(...submitters: Identifiable[]): Action<void> {
        return this.repo.delete(...submitters);
    }

    public sort(submitters: Identifiable[], motion: Identifiable): Action<void> {
        return this.repo.sort(submitters, motion);
    }
}
