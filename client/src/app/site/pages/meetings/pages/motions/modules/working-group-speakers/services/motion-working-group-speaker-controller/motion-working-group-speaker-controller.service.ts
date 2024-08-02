import { Injectable } from '@angular/core';
import { MotionWorkingGroupSpeaker } from 'src/app/domain/models/motions/motion-working-group-speaker';
import { MotionWorkingGroupSpeakerRepositoryService } from 'src/app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

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
