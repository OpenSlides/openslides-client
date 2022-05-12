import { Injectable } from '@angular/core';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { ViewMotionStatuteParagraph } from 'src/app/site/pages/meetings/pages/motions';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { Fieldsets, DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionStatuteParagraphAction } from './motion-statute-paragraph.action';
import { Id } from 'src/app/domain/definitions/key-types';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: 'root'
})
export class MotionStatuteParagraphRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionStatuteParagraph);
    }

    public override getFieldsets(): Fieldsets<MotionStatuteParagraph> {
        const defaultFields: (keyof MotionStatuteParagraph)[] = [`title`, `text`, `weight`];
        return {
            [DEFAULT_FIELDSET]: defaultFields
        };
    }

    public create(partialStatuteParagraph: Partial<MotionStatuteParagraph>): Promise<Identifiable> {
        const payload = this.getCreatePayload(partialStatuteParagraph);
        return this.sendActionToBackend(MotionStatuteParagraphAction.CREATE, payload);
    }

    public bulkCreate(partialEntries: Partial<MotionStatuteParagraph>[]): Promise<Identifiable[]> {
        const payload = partialEntries.map(paragraph => this.getCreatePayload(paragraph));
        return this.sendBulkActionToBackend(MotionStatuteParagraphAction.CREATE, payload);
    }

    public update(update: Partial<MotionStatuteParagraph>, viewModel: ViewMotionStatuteParagraph): Promise<void> {
        const payload = {
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
        const payload = {
            meeting_id: this.activeMeetingId,
            statute_paragraph_ids: statuteParagraphIds
        };
        return this.sendActionToBackend(MotionStatuteParagraphAction.SORT, payload);
    }

    public getTitle = (viewMotionStatuteParagraph: ViewMotionStatuteParagraph) => viewMotionStatuteParagraph.title;

    public getVerboseName = (plural: boolean = false) => _(plural ? `Statute paragraphs` : `Statute paragraph`);

    private getCreatePayload(partialStatuteParagraph: Partial<MotionStatuteParagraph>): any {
        return {
            meeting_id: this.activeMeetingId,
            text: partialStatuteParagraph.text,
            title: partialStatuteParagraph.title
        };
    }
}
