import { Injectable } from '@angular/core';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';
import { MotionWorkingGroupSpeakerRepositoryService } from '@app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionWorkingGroupSpeaker } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionWorkingGroupSpeakerControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        repo: MotionWorkingGroupSpeakerRepositoryService,
        userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, MotionWorkingGroupSpeaker, repo, userRepo);
    }
}
