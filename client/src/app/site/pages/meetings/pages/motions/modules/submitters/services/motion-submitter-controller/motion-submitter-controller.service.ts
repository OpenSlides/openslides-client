import { inject, Service } from '@angular/core';
import { MotionSubmitter } from '@app/domain/models/motions/motion-submitter';
import { MotionSubmitterRepositoryService } from '@app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionSubmitter } from '../../view-models';

@Service()
export class MotionSubmitterControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionSubmitterRepositoryService);
        const userRepo = inject(UserControllerService);
        super(controllerServiceCollector, MotionSubmitter, repo, userRepo);
    }
}
