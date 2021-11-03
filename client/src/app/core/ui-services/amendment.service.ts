import { Injectable } from '@angular/core';
import { AmendmentAction } from 'app/core/actions/amendment-action';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { createAgendaItem } from 'app/shared/utils/create-agenda-item';
import { ViewMotion } from 'app/site/motions/models/view-motion';

import { ActionService } from '../core-services/action.service';
import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { MotionRepositoryService } from '../repositories/motions/motion-repository.service';
import { RepositoryServiceCollector } from '../repositories/repository-service-collector';

@Injectable({
    providedIn: `root`
})
export class AmendmentService {
    private get activeMeetingIdService(): ActiveMeetingIdService {
        return this.repoServices.activeMeetingIdService;
    }

    private get actions(): ActionService {
        return this.repoServices.actionService;
    }

    public constructor(private repoServices: RepositoryServiceCollector, private motionRepo: MotionRepositoryService) {}

    public async createTextBased(
        partialMotion: Partial<AmendmentAction.CreateTextbasedPayload>
    ): Promise<Identifiable> {
        const payload: AmendmentAction.CreateTextbasedPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            lead_motion_id: partialMotion.lead_motion_id,
            title: partialMotion.title,
            text: partialMotion.text,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            block_id: partialMotion.block_id,
            state_extension: partialMotion.state_extension,
            sort_parent_id: partialMotion.sort_parent_id,
            tag_ids: partialMotion.tag_ids,
            supporter_ids: partialMotion.supporter_ids,
            ...createAgendaItem(partialMotion)
        };
        return this.actions.sendRequest(AmendmentAction.CREATE_TEXTBASED_AMENDMENT, payload);
    }

    public async createParagraphBased(
        partialMotion: Partial<AmendmentAction.CreateParagraphbasedPayload>
    ): Promise<Identifiable> {
        const payload: AmendmentAction.CreateParagraphbasedPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            lead_motion_id: partialMotion.lead_motion_id,
            title: partialMotion.title,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            block_id: partialMotion.block_id,
            state_extension: partialMotion.state_extension,
            amendment_paragraph_$: partialMotion.amendment_paragraph_$,
            sort_parent_id: partialMotion.sort_parent_id,
            tag_ids: partialMotion.tag_ids,
            supporter_ids: partialMotion.supporter_ids,
            ...createAgendaItem(partialMotion)
        };
        return this.actions.sendRequest(AmendmentAction.CREATE_PARAGRAPHBASED_AMENDMENT, payload);
    }

    public async createStatuteAmendment(
        partialMotion: Partial<AmendmentAction.CreateStatutebasedPayload>
    ): Promise<Identifiable> {
        const payload: AmendmentAction.CreateStatutebasedPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            title: partialMotion.title,
            text: partialMotion.text,
            origin_id: partialMotion.origin_id,
            submitter_ids: partialMotion.submitter_ids,
            workflow_id: partialMotion.workflow_id,
            category_id: partialMotion.category_id,
            attachment_ids: partialMotion.attachment_ids,
            reason: partialMotion.reason,
            number: partialMotion.number,
            block_id: partialMotion.block_id,
            state_extension: partialMotion.state_extension,
            statute_paragraph_id: partialMotion.statute_paragraph_id,
            sort_parent_id: partialMotion.sort_parent_id,
            tag_ids: partialMotion.tag_ids,
            supporter_ids: partialMotion.supporter_ids,
            ...createAgendaItem(partialMotion)
        };
        return this.actions.sendRequest(AmendmentAction.CREATE_STATUTEBASED_AMENDMENT, payload);
    }

    public async update(update: Partial<AmendmentAction.UpdatePayload>, viewModel: ViewMotion): Promise<void> {
        return this.motionRepo.update(update, viewModel);
    }

    public async delete(viewModel: ViewMotion): Promise<void> {
        const payload: AmendmentAction.DeletePayload = { id: viewModel.id };
        return this.actions.sendRequest(AmendmentAction.DELETE, payload);
    }
}
