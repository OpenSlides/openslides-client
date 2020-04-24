import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { HttpService } from 'app/core/core-services/http.service';
import { MotionBlock } from 'app/shared/models/motions/motion-block';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { MotionRepositoryService } from './motion-repository.service';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { Fieldsets, DEFAULT_FIELDSET } from 'app/core/core-services/model-request-builder.service';

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
    /**
     * Constructor for the motion block repository
     *
     * @param DS Data Store
     * @param mapperService Mapping collection strings to classes
     * @param dataSend Send models to the server
     * @param motionRepo Accessing the motion repository
     * @param httpService Sending a request directly
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService,
        private motionRepo: MotionRepositoryService,
        private httpService: HttpService
    ) {
        super(repositoryServiceCollector, MotionBlock, agendaItemRepo);
        this.initSorting();
    }

    public getFieldsets(): Fieldsets<MotionBlock> {
        const titleFields: (keyof MotionBlock)[] = [
            'title'
        ];
        const listFields: (keyof MotionBlock)[] = titleFields.concat([
            'internal'
        ]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            list: listFields,
            title: titleFields,
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
        const restPath = `/rest/motions/motion-block/${motionBlock.id}/follow_recommendations/`;
        await this.httpService.post(restPath);
    }

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'title'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewMotionBlock, b: ViewMotionBlock) => {
            return this.languageCollator.compare(a.title, b.title);
        });
    }
}
