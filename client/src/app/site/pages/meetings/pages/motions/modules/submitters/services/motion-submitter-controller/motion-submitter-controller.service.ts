import { Injectable } from '@angular/core';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { MotionSubmitterRepositoryService } from 'src/app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

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
