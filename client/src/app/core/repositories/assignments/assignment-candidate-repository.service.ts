import { Injectable } from '@angular/core';

import { AssignmentCandidate } from 'app/shared/models/assignments/assignment-candidate';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentCandidateRepositoryService extends BaseRepository<
    ViewAssignmentCandidate,
    AssignmentCandidate,
    {}
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, AssignmentCandidate);
    }

    public getTitle = (titleInformation: {}) => {
        return 'Candidate';
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Candidates' : 'Candidate');
    };
}
