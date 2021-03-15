import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { MotionAction } from 'app/core/actions/motion-action';
import { MotionBlockAction } from 'app/core/actions/motion-block-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionBlock } from 'app/shared/models/motions/motion-block';
import { createAgendaItem } from 'app/shared/utils/create-agenda-item';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { MotionRepositoryService } from './motion-repository.service';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository service for motion blocks
 */
@Injectable({
    providedIn: 'root'
})
export class MotionBlockRepositoryService extends BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewMotionBlock,
    MotionBlock
> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService,
        private motionRepo: MotionRepositoryService
    ) {
        super(repositoryServiceCollector, MotionBlock, agendaItemRepo);
        this.initSorting();
    }

    public create(partialModel: Partial<MotionBlockAction.CreatePayload>): Promise<Identifiable> {
        const payload: MotionBlockAction.CreatePayload = this.getCreatePayload(partialModel);
        return this.sendActionToBackend(MotionBlockAction.CREATE, payload);
    }

    public bulkCreate(motionBlocks: Partial<MotionBlock>[]): Promise<Identifiable[]> {
        const payload: MotionBlockAction.CreatePayload[] = motionBlocks.map(block => this.getCreatePayload(block));
        return this.sendBulkActionToBackend(MotionBlockAction.CREATE, payload);
    }

    public update(update: Partial<MotionBlock>, viewModel: ViewMotionBlock): Promise<void> {
        const payload: MotionBlockAction.UpdatePayload = {
            id: viewModel.id,
            title: update.title,
            internal: update.internal
        };
        return this.sendActionToBackend(MotionBlockAction.UPDATE, payload);
    }

    public delete(viewModel: ViewMotionBlock): Promise<any> {
        return this.sendActionToBackend(MotionBlockAction.DELETE, { id: viewModel.id });
    }

    public getFieldsets(): Fieldsets<MotionBlock> {
        const titleFields: (keyof MotionBlock)[] = ['title'];
        const listFields: (keyof MotionBlock)[] = titleFields.concat(['internal']);
        return {
            [DEFAULT_FIELDSET]: listFields,
            title: titleFields
        };
    }

    public getTitle = (viewMotionBlock: ViewMotionBlock) => {
        return viewMotionBlock.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Motion blocks' : 'Motion block');
    };

    /**
     * Removes the motion block id from the given motion
     *
     * @param viewMotion The motion to alter
     */
    public removeMotionFromBlock(viewMotion: ViewMotion): void {
        const updateMotion = viewMotion.motion;
        updateMotion.block_id = null;
        this.motionRepo.update(updateMotion, viewMotion);
    }

    /**
     * Retrieves motion blocks by name
     *
     * @param title String to check for
     * @returns the motion blocks found
     */
    public getMotionBlocksByTitle(title: string): MotionBlock[] {
        return this.DS.filter(MotionBlock, block => block.title === title);
    }

    /**
     * Signals the acceptance of the current recommendation of this motionBlock
     *
     * @param motionBlock
     */
    public async followRecommendation(motionBlock: ViewMotionBlock): Promise<void> {
        return this.sendBulkActionToBackend(
            MotionAction.FOLLOW_RECOMMENDATION,
            motionBlock.motion_ids.map(id => ({
                id
            }))
        );
    }

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'title'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewMotionBlock, b: ViewMotionBlock) => {
            return this.languageCollator.compare(a.title, b.title);
        });
    }

    private getCreatePayload(partialModel: Partial<MotionBlockAction.CreatePayload>): MotionBlockAction.CreatePayload {
        return {
            meeting_id: this.activeMeetingIdService.meetingId,
            title: partialModel.title,
            internal: partialModel.internal,
            ...createAgendaItem(partialModel)
        };
    }
}
