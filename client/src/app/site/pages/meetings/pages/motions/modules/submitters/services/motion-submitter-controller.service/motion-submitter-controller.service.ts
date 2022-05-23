import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { Action } from 'src/app/gateways/actions';
import { MotionSubmitterRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { MotionSubmitterCommonServiceModule } from '../../motion-submitter-common-service.module';
import { ViewMotionSubmitter } from '../../view-models';

@Injectable({
    providedIn: MotionSubmitterCommonServiceModule
})
export class MotionSubmitterControllerService extends BaseMeetingControllerService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionSubmitterRepositoryService
    ) {
        super(controllerServiceCollector, MotionSubmitter, repo);
    }

    public create(motion: Identifiable, ...users: Identifiable[]): Action<Identifiable[]> {
        return this.repo.create(motion, ...users);
    }

    public delete(...submitters: Identifiable[]): Action<void> {
        return this.repo.delete(...submitters);
    }

    public sort(submitters: Identifiable[], motion: Identifiable): Promise<void> {
        return this.repo.sort(submitters, motion);
    }
}
