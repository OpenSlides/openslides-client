import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Assignment } from 'app/shared/models/assignments/assignment';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewUser } from 'app/site/users/models/view-user';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Service for Assignments.
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentRepositoryService extends BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewAssignment,
    Assignment
> {
    private readonly restPath = '/rest/assignments/assignment/';
    private readonly candidatureOtherPath = '/candidature_other/';
    private readonly candidatureSelfPath = '/candidature_self/';

    /**
     * Constructor for the Assignment Repository.
     *
     * @param DS DataStore access
     * @param dataSend Sending data
     * @param mapperService Map models to object
     * @param viewModelStoreService Access view models
     * @param translate Translate string
     * @param httpService make HTTP Requests
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, Assignment, agendaItemRepo);
    }

    public getFieldsets(): Fieldsets<Assignment> {
        const titleFields: (keyof Assignment)[] = ['title'];
        const listFields: (keyof Assignment)[] = titleFields.concat(['open_posts', 'phase']);
        return {
            [DEFAULT_FIELDSET]: listFields.concat([
                'description',
                'default_poll_description',
                'number_poll_candidates'
            ]),
            list: listFields,
            title: titleFields
        };
    }

    public getTitle = (viewAssignment: ViewAssignment) => {
        return viewAssignment.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Elections' : 'Election');
    };

    /**
     * Adds/removes another user to/from the candidates list of an assignment
     *
     * @param user A ViewUser
     * @param assignment The assignment to add the candidate to
     * @param adding optional boolean to force an add (true)/ remove (false)
     * of the candidate. Else, the candidate will be added if not on the list,
     * and removed if on the list
     */
    public async changeCandidate(userId: number, assignment: ViewAssignment, adding?: boolean): Promise<void> {
        const data = { user: userId };
        if (assignment.candidates.some(candidate => candidate.id === userId) && adding !== true) {
            throw new Error('TODO');
            // await this.httpService.delete(this.restPath + assignment.id + this.candidatureOtherPath, data);
        } else if (adding !== false) {
            throw new Error('TODO');
            // await this.httpService.post(this.restPath + assignment.id + this.candidatureOtherPath, data);
        }
    }

    /**
     * Add the operator as candidate to the assignment
     *
     * @param assignment The assignment to add the candidate to
     */
    public async addSelf(assignment: ViewAssignment): Promise<void> {
        throw new Error('TODO');
        // await this.httpService.post(this.restPath + assignment.id + this.candidatureSelfPath);
    }

    /**
     * Removes the current user (operator) from the list of candidates for an assignment
     *
     * @param assignment The assignment to remove ourself from
     */
    public async deleteSelf(assignment: ViewAssignment): Promise<void> {
        // await this.httpService.delete(this.restPath + assignment.id + this.candidatureSelfPath);
        throw new Error('TODO');
    }

    /**
     * Sends a request to sort an assignment's candidates
     *
     * @param sortedCandidates the id of the assignment related users (note: NOT viewUsers)
     * @param assignment
     */
    public async sortCandidates(sortedCandidates: number[], assignment: ViewAssignment): Promise<void> {
        const restPath = `/rest/assignments/assignment/${assignment.id}/sort_related_users/`;
        const data = { related_users: sortedCandidates };
        // await this.httpService.post(restPath, data);
        throw new Error('TODO');
    }
}
