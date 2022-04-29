import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { AssignmentCandidate } from 'src/app/domain/models/assignments/assignment-candidate';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { AssignmentCandidateRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-candidate-repository.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { Id } from 'src/app/domain/definitions/key-types';
import { Action } from 'src/app/gateways/actions';
import { ViewAssignmentCandidate } from 'src/app/site/pages/meetings/pages/assignments';
import { AssignmentDetailServiceModule } from './assignment-detail-service.module';

@Injectable({ providedIn: AssignmentDetailServiceModule })
export class AssignmentCandidateControllerService extends BaseMeetingControllerService<
    ViewAssignmentCandidate,
    AssignmentCandidate
> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: AssignmentCandidateRepositoryService
    ) {
        super(controllerServiceCollector, AssignmentCandidate, repo);
    }

    public create(assignment: Identifiable, userId: Id): Promise<Identifiable> {
        return this.repo.create(assignment, userId);
    }

    public delete(...candidates: Identifiable[]): Promise<void> {
        const actions = candidates.map(candidate => this.repo.delete(candidate));
        return Action.from(...actions).resolve() as Promise<void>;
    }

    public sort(assignment: Identifiable, candidates: Identifiable[]): Promise<void> {
        return this.repo.sort(assignment, candidates);
    }
}
