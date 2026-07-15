import { Injectable } from '@angular/core';
import { MotionSubmitter } from '@app/domain/models/motions/motion-submitter';
import { MotionSubmitterRepositoryService } from '@app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionSubmitter } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionSubmitterControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        repo: MotionSubmitterRepositoryService,
        userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, MotionSubmitter, repo, userRepo);
    }
}
