import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { AssignmentAction } from 'app/core/actions/assignment-action';
import { AssignmentCandidateAction } from 'app/core/actions/assignment-candidate-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { Assignment } from 'app/shared/models/assignments/assignment';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
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
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, Assignment, agendaItemRepo);
    }

    public getFieldsets(): Fieldsets<Assignment> {
        const titleFields: (keyof Assignment)[] = ['title'];
        const listFields: (keyof Assignment)[] = titleFields.concat(['open_posts', 'phase', 'candidate_ids']);
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

    public create(partialAssignment: Partial<Assignment>): Promise<Identifiable> {
        partialAssignment.phase = undefined;
        const payload: AssignmentAction.CreatePayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            ...this.getPartialPayload(partialAssignment)
        };
        return this.sendActionToBackend(AssignmentAction.CREATE, payload);
    }

    public update(update: Partial<Assignment>, viewModel: ViewAssignment): Promise<void> {
        const payload: AssignmentAction.UpdatePayload = {
            id: viewModel.id,
            ...this.getPartialPayload(update)
        };
        return this.sendActionToBackend(AssignmentAction.UPDATE, payload);
    }

    public delete(...viewModels: ViewAssignment[]): Promise<void> {
        const payload: AssignmentAction.DeletePayload[] = viewModels.map(model => ({ id: model.id }));
        return this.sendBulkActionToBackend(AssignmentAction.DELETE, payload);
    }

    public getTitle = (viewAssignment: ViewAssignment) => {
        return viewAssignment.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Elections' : 'Election');
    };

    private getPartialPayload(model: Partial<ViewAssignment>): any {
        return {
            attachment_ids: model.attachment_ids,
            default_poll_description: model.default_poll_description,
            description: model.description,
            number_poll_candidates: model.number_poll_candidates,
            open_posts: model.open_posts,
            phase: model.phase,
            tag_ids: model.tag_ids,
            title: model.title
        };
    }
}
