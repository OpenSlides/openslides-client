import { inject, Service } from '@angular/core';
import { MotionSubmitter } from '@app/domain/models/motions/motion-submitter';
import { MotionSubmitterRepositoryService } from '@app/gateways/repositories/motions/motion-submitter-repository.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionSubmitter } from '../../view-models';

@Service()
export class MotionSubmitterControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    protected override repo = inject(MotionSubmitterRepositoryService);

    public baseModelCtor = MotionSubmitter;
}
