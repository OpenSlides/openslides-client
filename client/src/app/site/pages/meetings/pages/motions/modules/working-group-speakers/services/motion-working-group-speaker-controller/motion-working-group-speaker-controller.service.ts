import { inject, Service } from '@angular/core';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';
import { MotionWorkingGroupSpeakerRepositoryService } from '@app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionWorkingGroupSpeaker } from '../../view-models';

@Service()
export class MotionWorkingGroupSpeakerControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionWorkingGroupSpeakerRepositoryService);
        const userRepo = inject(UserControllerService);
        super(controllerServiceCollector, MotionWorkingGroupSpeaker, repo, userRepo);
    }
}
