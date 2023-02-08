import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Action } from 'src/app/gateways/actions';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { ViewAssignmentCandidate } from 'src/app/site/pages/meetings/pages/assignments';
import { UnknownUserLabel } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll/services/assignment-poll.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { AssignmentCandidate } from '../../../../domain/models/assignments/assignment-candidate';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { AssignmentCandidateAction } from './assignment-candidate.action';

@Injectable({
    providedIn: `root`
})
export class AssignmentCandidateRepositoryService extends BaseMeetingRelatedRepository<
    ViewAssignmentCandidate,
    AssignmentCandidate
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, AssignmentCandidate);
    }

    public override getFieldsets(): Fieldsets<AssignmentCandidate> {
        return {
            [DEFAULT_FIELDSET]: [`weight`, `meeting_user_id`, `assignment_id`]
        };
    }

    public getTitle = (viewAssignmentCandidate: ViewAssignmentCandidate) =>
        viewAssignmentCandidate.user?.getTitle() ?? UnknownUserLabel;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Candidates` : `Candidate`);

    public async create(assignment: Identifiable, userId: Id): Promise<Identifiable> {
        const payload = {
            assignment_id: assignment.id,
            user_id: userId
        };
        return this.sendActionToBackend(AssignmentCandidateAction.CREATE, payload);
    }

    public delete(candidate: Identifiable): Action<void> {
        const payload: Identifiable = { id: candidate.id };
        return this.createAction(AssignmentCandidateAction.DELETE, [payload]);
    }

    /**
     * Sends a request to sort an assignment's candidates
     *
     * @param sortedCandidates the id of the assignment related users (note: NOT viewUsers)
     * @param assignment
     */
    public async sort(assignment: Identifiable, sortedCandidates: Identifiable[]): Promise<void> {
        const payload = {
            candidate_ids: sortedCandidates.map(candidate => candidate.id),
            assignment_id: assignment.id
        };
        return this.sendActionToBackend(AssignmentCandidateAction.SORT, payload);
    }
}
