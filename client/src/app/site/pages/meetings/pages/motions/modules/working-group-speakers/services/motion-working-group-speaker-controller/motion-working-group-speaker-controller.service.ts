import { inject, Service } from '@angular/core';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';
import { MotionWorkingGroupSpeakerRepositoryService } from '@app/gateways/repositories/motions/motion-working-group-speaker-repository';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionWorkingGroupSpeaker } from '../../view-models/view-motion-working-group-speaker';

@Service()
export class MotionWorkingGroupSpeakerControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    protected repo = inject(MotionWorkingGroupSpeakerRepositoryService);

    public baseModelCtor = MotionWorkingGroupSpeaker;
}
