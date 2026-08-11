import { inject, Service } from '@angular/core';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';
import { MotionWorkingGroupSpeakerRepositoryService } from '@app/gateways/repositories/motions';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionWorkingGroupSpeaker } from '../../view-models';

@Service()
export class MotionWorkingGroupSpeakerControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    protected override repo = inject(MotionWorkingGroupSpeakerRepositoryService);

    public constructor() {
        super(MotionWorkingGroupSpeaker);
    }
}
