import { Injectable } from '@angular/core';

import { MotionStatuteParagraphAction } from 'app/core/actions/motion-statue-paragraph-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for statute paragraphs
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionStatuteParagraphRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionStatuteParagraph);
    }

    public getFieldsets(): Fieldsets<MotionStatuteParagraph> {
        return {
            [DEFAULT_FIELDSET]: ['title', 'text', 'weight']
        };
    }

    public create(partialStatuteParagraph: Partial<MotionStatuteParagraph>): Promise<Identifiable> {
        const payload: MotionStatuteParagraphAction.CreatePayload = this.getCreatePayload(partialStatuteParagraph);
        return this.sendActionToBackend(MotionStatuteParagraphAction.CREATE, payload);
    }

    public bulkCreate(partialEntries: Partial<MotionStatuteParagraph>[]): Promise<Identifiable[]> {
        const payload: MotionStatuteParagraphAction.CreatePayload[] = partialEntries.map(paragraph =>
            this.getCreatePayload(paragraph)
        );
        return this.sendBulkActionToBackend(MotionStatuteParagraphAction.CREATE, payload);
    }

    public update(update: Partial<MotionStatuteParagraph>, viewModel: ViewMotionStatuteParagraph): Promise<void> {
        const payload: MotionStatuteParagraphAction.UpdatePayload = {
            id: viewModel.id,
            text: update.text,
            title: update.title
        };
        return this.sendActionToBackend(MotionStatuteParagraphAction.UPDATE, payload);
    }

    public delete(viewModel: ViewMotionStatuteParagraph): Promise<void> {
        return this.sendActionToBackend(MotionStatuteParagraphAction.DELETE, { id: viewModel.id });
    }

    public sort(statuteParagraphIds: Id[]): Promise<void> {
        const payload: MotionStatuteParagraphAction.SortPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            statute_paragraph_ids: statuteParagraphIds
        };
        return this.sendActionToBackend(MotionStatuteParagraphAction.SORT, payload);
    }

    public getTitle = (viewMotionStatuteParagraph: ViewMotionStatuteParagraph) => {
        return viewMotionStatuteParagraph.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Statute paragraphs' : 'Statute paragraph');
    };

    private getCreatePayload(
        partialStatuteParagraph: Partial<MotionStatuteParagraph>
    ): MotionStatuteParagraphAction.CreatePayload {
        return {
            meeting_id: this.activeMeetingIdService.meetingId,
            text: partialStatuteParagraph.text,
            title: partialStatuteParagraph.title
        };
    }
}
