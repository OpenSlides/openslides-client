import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { MotionStateRepositoryService } from 'src/app/gateways/repositories/motions';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { MotionStateCommonServiceModule } from '../../motion-state-common-service.module';
import { ViewMotionState } from '../../view-models';

@Injectable({
    providedIn: MotionStateCommonServiceModule
})
export class MotionStateControllerService extends BaseMeetingControllerService<ViewMotionState, MotionState> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionStateRepositoryService
    ) {
        super(controllerServiceCollector, MotionState, repo);
    }

    public create(state: Partial<MotionState>): Promise<Identifiable> {
        return this.repo.create(state);
    }

    public update(update: Partial<MotionState>, state: Identifiable): Promise<void> {
        return this.repo.update(update, state);
    }

    public delete(state: Identifiable): Promise<void> {
        return this.repo.delete(state);
    }
}
