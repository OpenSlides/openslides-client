import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionSupporter } from 'src/app/domain/models/motions/motion-supporter';
import { Action } from 'src/app/gateways/actions';
import { MotionSupporterRepositoryService } from 'src/app/gateways/repositories/motions/motion-supporter';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { ViewMotion } from '../../../../view-models';
import { ViewMotionSupporter } from '../../view-models/view-motion-supporter';

@Injectable({
    providedIn: `root`
})
export class MotionSupporterControllerService extends BaseMeetingControllerService<
    ViewMotionSupporter,
    MotionSupporter
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionSupporterRepositoryService,
        private userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, MotionSupporter, repo);
    }

    public create(motion: ViewMotion, ...users: Identifiable[]): Action<Identifiable[]> {
        const meetingUsers = users.map(user => this.userRepo.getViewModel(user.id)?.getMeetingUser(motion.meeting_id));
        return this.repo.create(motion, ...meetingUsers);
    }

    public delete(...models: ViewMotionSupporter[]): Action<void> {
        return this.repo.delete(...models);
    }
}
