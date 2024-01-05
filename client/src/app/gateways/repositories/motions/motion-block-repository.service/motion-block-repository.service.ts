import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewMotionBlock } from 'src/app/site/pages/meetings/pages/motions';

import { MotionBlock } from '../../../../domain/models/motions/motion-block';
import { createAgendaItem } from '../../agenda';
import { BaseAgendaItemAndListOfSpeakersContentObjectRepository } from '../../base-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionBlockAction } from './motion-block.action';

@Injectable({
    providedIn: `root`
})
export class MotionBlockRepositoryService extends BaseAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewMotionBlock,
    MotionBlock
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionBlock);
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

    public getTitle = (viewMotionBlock: ViewMotionBlock) => viewMotionBlock.title;

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Motion blocks` : `Motion block`);

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
