import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionCategory } from 'src/app/domain/models/motions/motion-category';
import { Action } from 'src/app/gateways/actions';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { ViewMotionCategory } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets, ROUTING_FIELDSET } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionCategoryAction } from './motion-category.action';

@Injectable({
    providedIn: `root`
})
export class MotionCategoryRepositoryService extends BaseMeetingRelatedRepository<ViewMotionCategory, MotionCategory> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionCategory);

        this.setSortFunction((a, b) => a.weight - b.weight);
    }

    public create(...categories: Partial<MotionCategory>[]): Promise<Identifiable[]> {
        const payload = categories.map(category => this.getCreatePayload(category));
        return this.sendBulkActionToBackend(MotionCategoryAction.CREATE, payload);
    }

    public update(update: Partial<MotionCategory>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            prefix: !!update.prefix ? update.prefix : null // "" -> null
        };
        return this.sendActionToBackend(MotionCategoryAction.UPDATE, payload);
    }

    public delete(viewModel: Identifiable): Action<void> {
        return this.createAction(MotionCategoryAction.DELETE, { id: viewModel.id });
    }

    public override getFieldsets(): Fieldsets<MotionCategory> {
        const routingFields: (keyof MotionCategory)[] = [`sequential_number`, `meeting_id`];
        const detailFields: (keyof MotionCategory)[] = [`name`, `prefix`];
        const sortListFields: (keyof MotionCategory)[] = detailFields.concat([
            `weight`,
            `level`,
            `parent_id`,
            `child_ids`
        ]);
        const listFields: (keyof MotionCategory)[] = sortListFields.concat([`motion_ids`]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            [ROUTING_FIELDSET]: routingFields,
            list: listFields,
            sortList: sortListFields
        };
    }

    public getTitle = (viewMotionCategory: ViewMotionCategory) =>
        viewMotionCategory.prefix
            ? viewMotionCategory.prefix + ` - ` + viewMotionCategory.name
            : viewMotionCategory.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Categories` : `Category`);

    /**
     * Updates a categories numbering.
     *
     * @param viewMotionCategory the category it should be updated in
     */
    public async numberMotionsInCategory(viewMotionCategory: Identifiable): Promise<void> {
        return this.actions.sendRequest(MotionCategoryAction.NUMBER_MOTIONS, { id: viewMotionCategory.id });
    }

    /**
     * Updates the sorting of motions in a category.
     *
     * @param category the category it should be updated in
     * @param motionIds the list of motion ids on this category
     */
    public async sortMotionsInCategory(category: Identifiable, motionIds: number[]): Promise<void> {
        const payload = {
            id: category.id,
            motion_ids: motionIds
        };
        return this.actions.sendRequest(MotionCategoryAction.SORT_MOTIONS_IN_CATEGORY, payload);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortCategories(data: TreeIdNode[]): Promise<void> {
        const payload = {
            meeting_id: this.activeMeetingId,
            tree: data
        };
        return this.actions.sendRequest(MotionCategoryAction.SORT, payload);
    }

    private getCreatePayload(partialCategory: Partial<MotionCategory>): any {
        return {
            meeting_id: this.activeMeetingId,
            name: partialCategory.name,
            prefix: partialCategory.prefix,
            parent_id: partialCategory.parent_id
        };
    }
}
