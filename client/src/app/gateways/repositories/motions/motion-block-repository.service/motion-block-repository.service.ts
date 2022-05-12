import { Injectable } from '@angular/core';
import { ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';
import { MotionBlock } from '../../../../domain/models/motions/motion-block';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseAgendaItemAndListOfSpeakersContentObjectRepository } from '../../base-agenda-item-and-list-of-speakers-content-object-repository';
import { MotionAction } from '../motion-repository.service';
import { AgendaItemRepositoryService, createAgendaItem } from '../../agenda';
import { Identifiable } from 'src/app/domain/interfaces';
import { DEFAULT_FIELDSET, Fieldsets, ROUTING_FIELDSET } from 'src/app/site/services/model-request-builder';
import { MotionBlockAction } from './motion-block.action';

@Injectable({
    providedIn: 'root'
})
export class MotionBlockRepositoryService extends BaseAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewMotionBlock,
    MotionBlock
> {
    constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, MotionBlock, agendaItemRepo);
        this.initSorting();
    }

    public create(...blocks: any[]): Promise<Identifiable[]> {
        const payload: any[] = blocks.map(block => this.getCreatePayload(block));
        return this.sendBulkActionToBackend(MotionBlockAction.CREATE, payload);
    }

    public update(update: Partial<MotionBlock>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            title: update.title,
            internal: update.internal
        };
        return this.sendActionToBackend(MotionBlockAction.UPDATE, payload);
    }

    public delete(...viewModels: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = viewModels.map(model => ({ id: model.id }));
        return this.sendBulkActionToBackend(MotionBlockAction.DELETE, payload);
    }

    public override getFieldsets(): Fieldsets<MotionBlock> {
        const routingFields: (keyof MotionBlock)[] = [`sequential_number`];
        const titleFields: (keyof MotionBlock)[] = [`title`];
        const listFields: (keyof MotionBlock)[] = titleFields.concat([`internal`, `agenda_item_id`]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            [ROUTING_FIELDSET]: routingFields,
            title: titleFields
        };
    }

    public getTitle = (viewMotionBlock: ViewMotionBlock) => viewMotionBlock.title;

    public getVerboseName = (plural: boolean = false) =>
        this.translate.instant(plural ? `Motion blocks` : `Motion block`);

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'title'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewMotionBlock, b: ViewMotionBlock) =>
            this.languageCollator.compare(a.title, b.title)
        );
    }

    private getCreatePayload(partialModel: any): any {
        return {
            meeting_id: this.activeMeetingId,
            title: partialModel.title,
            internal: partialModel.internal,
            ...createAgendaItem(partialModel)
        };
    }
}
