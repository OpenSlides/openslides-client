import { Injectable } from '@angular/core';
import { AssignmentCandidateAction } from 'app/core/actions/assignment-candidate-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { AssignmentCandidate } from 'app/shared/models/assignments/assignment-candidate';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: `root`
})
export class AssignmentCandidateRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewAssignmentCandidate,
    AssignmentCandidate
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentCandidate);
    }

    public getFieldsets(): Fieldsets<AssignmentCandidate> {
        return {
            [DEFAULT_FIELDSET]: [`weight`, `user_id`, `assignment_id`]
        };
    }

    public getTitle = (viewAssignmentCandidate: ViewAssignmentCandidate) => viewAssignmentCandidate.user.getTitle();

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Candidates` : `Candidate`);

    public create(assignment: ViewAssignment, userId: Id): Promise<Identifiable> {
        const payload: AssignmentCandidateAction.CreatePayload = {
            assignment_id: assignment.id,
            user_id: userId
        };
        return this.sendActionToBackend(AssignmentCandidateAction.ADD, payload);
    }

    public delete(candidate: ViewAssignmentCandidate): Promise<void> {
        const payload: AssignmentCandidateAction.DeletePayload = { id: candidate.id };
        return this.sendActionToBackend(AssignmentCandidateAction.REMOVE, payload);
    }

    /**
     * Sends a request to sort an assignment's candidates
     *
     * @param sortedCandidates the id of the assignment related users (note: NOT viewUsers)
     * @param assignment
     */
    public async sort(assignment: ViewAssignment, sortedCandidates: ViewAssignmentCandidate[]): Promise<void> {
        const payload: AssignmentCandidateAction.SortPayload = {
            candidate_ids: sortedCandidates.map(candidate => candidate.id),
            assignment_id: assignment.id
        };
        return this.sendActionToBackend(AssignmentCandidateAction.SORT, payload);
    }
}
