import { Injectable } from '@angular/core';

import { MotionCategoryAction } from 'app/core/actions/motion-category-action';
import { ActionType } from 'app/core/core-services/action.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { TreeIdNode } from 'app/core/ui-services/tree.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionCategory } from 'app/shared/models/motions/motion-category';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for Categories
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionCategoryRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionCategory,
    MotionCategory
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionCategory);

        this.setSortFunction((a, b) => a.weight - b.weight);
    }

    public create(partialCategory: Partial<MotionCategory>): Promise<Identifiable> {
        const payload: MotionCategoryAction.CreatePayload = {
            meeting_id: this.activeMeetingService.meetingId,
            name: partialCategory.name,
            prefix: partialCategory.prefix,
            parent_id: partialCategory.parent_id
        };
        return this.sendActionToBackend(ActionType.MOTION_CATEGORY_CREATE, payload);
    }

    public update(update: Partial<MotionCategory>, viewModel: ViewMotionCategory): Promise<void> {
        const payload: MotionCategoryAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            prefix: update.prefix
        };
        return this.sendActionToBackend(ActionType.MOTION_CATEGORY_UPDATE, payload);
    }

    public delete(viewModel: ViewMotionCategory): Promise<void> {
        return this.sendActionToBackend(ActionType.MOTION_CATEGORY_DELETE, { id: viewModel.id });
    }

    public getFieldsets(): Fieldsets<MotionCategory> {
        const detailFields: (keyof MotionCategory)[] = ['name', 'prefix'];
        const sortListFields: (keyof MotionCategory)[] = detailFields.concat(['weight']);
        const listFields: (keyof MotionCategory)[] = sortListFields.concat(['motion_ids']);
        return {
            [DEFAULT_FIELDSET]: detailFields,
            list: listFields,
            sortList: sortListFields
        };
    }

    public getTitle = (viewMotionCategory: ViewMotionCategory) => {
        return viewMotionCategory.prefix
            ? viewMotionCategory.prefix + ' - ' + viewMotionCategory.name
            : viewMotionCategory.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Categories' : 'Category');
    };

    /**
     * Updates a categories numbering.
     *
     * @param viewMotionCategory the category it should be updated in
     */
    public async numberMotionsInCategory(viewMotionCategory: ViewMotionCategory): Promise<void> {
        return this.actions.sendRequest(ActionType.MOTION_CATEGORY_NUMBER_MOTIONS, { id: viewMotionCategory.id });
    }

    /**
     * Updates the sorting of motions in a category.
     *
     * @param viewMotionCategory the category it should be updated in
     * @param motionIds the list of motion ids on this category
     */
    public async sortMotionsInCategory(viewMotionCategory: MotionCategory, motionIds: number[]): Promise<void> {
        const payload: MotionCategoryAction.SortMotionsInCategoryPayload = {
            id: viewMotionCategory.id,
            motion_ids: motionIds
        };
        return this.actions.sendRequest(ActionType.MOTION_CATEGORY_SORT_MOTIONS, payload);
    }

    /**
     * Sends the changed nodes to the server.
     *
     * @param data The reordered data from the sorting
     */
    public async sortCategories(data: TreeIdNode[]): Promise<void> {
        const payload: MotionCategoryAction.SortPayload = {
            meeting_id: this.activeMeetingService.meetingId,
            nodes: data
        };
        return this.actions.sendRequest(ActionType.MOTION_CATEGORY_SORT, payload);
    }
}
