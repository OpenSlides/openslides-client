import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionCategory } from 'src/app/domain/models/motions/motion-category';
import { Action } from 'src/app/gateways/actions';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { ViewMotionCategory } from 'src/app/site/pages/meetings/pages/motions';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionCategoryAction } from './motion-category.action';

@Injectable({
    providedIn: `root`
})
export class MotionCategoryRepositoryService extends BaseMeetingRelatedRepository<ViewMotionCategory, MotionCategory> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionCategory);
    }

    public override getViewModelList(): ViewMotionCategory[] {
        return this.filterForeignMeetingModelsFromList(super.getViewModelList());
    }

    public override getViewModelListObservable(): Observable<ViewMotionCategory[]> {
        return super.getViewModelListObservable().pipe(map(cat => this.filterForeignMeetingModelsFromList(cat)));
    }

    public create(...categories: Partial<MotionCategory>[]): Promise<Identifiable[]> {
        const payload = categories.map(category => this.getCreatePayload(category));
        return this.sendBulkActionToBackend(MotionCategoryAction.CREATE, payload);
    }

    public update(update: Partial<MotionCategory>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            prefix: update.prefix ? update.prefix : null // "" -> null
        };
        return this.sendActionToBackend(MotionCategoryAction.UPDATE, payload);
    }

    public delete(viewModel: Identifiable): Action<void> {
        return this.createAction(MotionCategoryAction.DELETE, { id: viewModel.id });
    }

    public override getFieldsets(): Fieldsets<MotionCategory> {
        const detailFields: (keyof MotionCategory)[] = [`sequential_number`, `meeting_id`, `name`, `prefix`];
        const sortListFields: (keyof MotionCategory)[] = detailFields.concat([
            `weight`,
            `level`,
            `parent_id`,
            `child_ids`
        ]);
        const listFields: (keyof MotionCategory)[] = sortListFields.concat([`motion_ids`]);
        return {
            ...super.getFieldsets(),
            list: listFields,
            sortList: sortListFields
        };
    }

    public getTitle = (viewMotionCategory: ViewMotionCategory): string =>
        viewMotionCategory.prefix
            ? viewMotionCategory.prefix + ` - ` + viewMotionCategory.name
            : viewMotionCategory.name;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Categories` : `Category`);

    /**
     * Updates a categories numbering.
     *
     * @param viewMotionCategory the category it should be updated in
     */
    public async numberMotionsInCategory(viewMotionCategory: Identifiable): Promise<void> {
        await this.createAction(MotionCategoryAction.NUMBER_MOTIONS, { id: viewMotionCategory.id }).resolve();
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
        await this.createAction(MotionCategoryAction.SORT_MOTIONS_IN_CATEGORY, payload).resolve();
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
        await this.createAction(MotionCategoryAction.SORT, payload).resolve();
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
