import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { MotionState } from '@app/domain/models/motions/motion-state';
import { Action } from '@app/gateways/actions';
import { MotionStateRepositoryService } from '@app/gateways/repositories/motions';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewMotionState } from '../../view-models';

@Service()
export class MotionStateControllerService extends BaseMeetingControllerService<ViewMotionState, MotionState> {
    protected override repo: MotionStateRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionStateRepositoryService);
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

    public sort(workflowId: Id, states: Identifiable[]): Action<void> {
        return this.repo.sort(workflowId, states);
    }
}
