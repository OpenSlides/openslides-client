import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { SequentialNumberMappingService } from '@app/site/pages/meetings/services/sequential-number-mapping.service';
import { Fieldsets } from '@app/site/services/model-request-builder';

import { Assignment } from '../../../../domain/models/assignments/assignment';
import { createAgendaItem } from '../../agenda/functions';
import { BaseAgendaItemAndListOfSpeakersContentObjectRepository } from '../../base-agenda-item-and-list-of-speakers-content-object-repository';
import { CreateResponse } from '../../base-repository';
import { AssignmentAction } from './assignment.action';

@Service()
export class AssignmentRepositoryService extends BaseAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewAssignment,
    Assignment
> {
    private sequentialNumber = inject(SequentialNumberMappingService);

    public baseModelCtor = Assignment;

    public override getFieldsets(): Fieldsets<Assignment> {
        const titleFields: (keyof Assignment)[] = [`sequential_number`, `meeting_id`, `title`];
        const listFields: (keyof Assignment)[] = titleFields.concat([`open_posts`, `phase`, `candidate_ids`]);
        return {
            ...super.getFieldsets(),
            list: listFields,
            title: titleFields
        };
    }

    public async create(partialAssignment: Partial<Assignment>): Promise<CreateResponse> {
        partialAssignment.phase = undefined;
        const payload = {
            meeting_id: this.activeMeetingId,
            ...this.getPartialPayload(partialAssignment),
            ...createAgendaItem(partialAssignment)
        };
        const data: CreateResponse = await this.sendActionToBackend(AssignmentAction.CREATE, payload);
        if (data.sequential_number) {
            this.sequentialNumber.setSequentialNumber(
                ViewAssignment.COLLECTION,
                payload.meeting_id,
                data.sequential_number,
                data.id
            );
        }

        return data;
    }

    public update(update: Partial<Assignment>, viewModel: ViewAssignment): Promise<void> {
        const payload = {
            id: viewModel.id,
            ...this.getPartialPayload(update)
        };
        return this.sendActionToBackend(AssignmentAction.UPDATE, payload);
    }

    public delete(...viewModels: ViewAssignment[]): Promise<void> {
        const payload: Identifiable[] = viewModels.map(model => ({ id: model.id }));
        return this.sendBulkActionToBackend(AssignmentAction.DELETE, payload);
    }

    public getTitle = (viewAssignment: ViewAssignment): string => viewAssignment.title;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Elections` : `Election`);

    private getPartialPayload(model: Partial<ViewAssignment> & { attachment_mediafile_ids?: Id[] }): any {
        return {
            attachment_mediafile_ids: model.attachment_mediafile_ids === null ? [] : model.attachment_mediafile_ids,
            default_poll_description: model.default_poll_description,
            description: model.description,
            number_poll_candidates: model.number_poll_candidates,
            open_posts: model.open_posts,
            phase: model.phase,
            tag_ids: model.tag_ids === null ? [] : model.tag_ids,
            title: model.title
        };
    }
}
