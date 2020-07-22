import { Injectable } from '@angular/core';

import { AssignmentCandidate } from 'app/shared/models/assignments/assignment-candidate';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { BaseRepository } from '../base-repository';
import { MeetingModelBaseRepository } from '../meeting-model-base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentCandidateRepositoryService extends MeetingModelBaseRepository<
    ViewAssignmentCandidate,
    AssignmentCandidate
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentCandidate);
    }

    public getTitle = (viewAssignmentCandidate: ViewAssignmentCandidate) => {
        return 'Candidate';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Candidates' : 'Candidate');
    };
}
