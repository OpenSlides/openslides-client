import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { AssignmentCandidate } from 'src/app/domain/models/assignments/assignment-candidate';
import { Action } from 'src/app/gateways/actions';
import { AssignmentCandidateRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-candidate-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewAssignmentCandidate } from 'src/app/site/pages/meetings/pages/assignments';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { AssignmentDetailServiceModule } from './assignment-detail-service.module';

@Injectable({ providedIn: AssignmentDetailServiceModule })
export class AssignmentCandidateControllerService extends BaseMeetingControllerService<
    ViewAssignmentCandidate,
    AssignmentCandidate
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: AssignmentCandidateRepositoryService
    ) {
        super(controllerServiceCollector, AssignmentCandidate, repo);
    }

    public create(assignment: Identifiable, meetingUserId: Id): Promise<Identifiable> {
        return this.repo.create(assignment, meetingUserId);
    }

    public delete(...candidates: Identifiable[]): Promise<void> {
        const actions = candidates.map(candidate => this.repo.delete(candidate));
        return Action.from(...actions).resolve() as Promise<void>;
    }

    public sort(assignment: Identifiable, candidates: Identifiable[]): Promise<void> {
        return this.repo.sort(assignment, candidates);
    }
}
