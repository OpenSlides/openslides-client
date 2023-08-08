import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { PointOfOrderCategory } from 'src/app/domain/models/point-of-order-category/point-of-order-category';
import { ListUpdateData } from 'src/app/infrastructure/utils';
import { ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/view-models/view-point-of-order-category';

import { Action } from '../../actions';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { CanPerformListUpdates } from '../base-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { PointOfOrderCategoryAction } from './point-of-order-category.action';

@Injectable({
    providedIn: `root`
})
export class PointOfOrderCategoryRepositoryService
    extends BaseMeetingRelatedRepository<ViewPointOfOrderCategory, PointOfOrderCategory>
    implements CanPerformListUpdates<PointOfOrderCategory, void | Identifiable>
{
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PointOfOrderCategory);
    }

    public getVerboseName = (plural?: boolean): string =>
        plural ? `Point of order categories` : `Point of order category`;
    public getTitle = (viewModel: PointOfOrderCategory): string => viewModel.text;

    public create(pointOfOrderCategory: any, meeting_id: Id = this.activeMeetingId): Action<Identifiable> {
        const models = Array.isArray(pointOfOrderCategory) ? pointOfOrderCategory : [pointOfOrderCategory];
        const payload: any[] = models.map(model => ({
            meeting_id: model.meeting_id || meeting_id,
            text: model.text,
            rank: model.rank
        }));
        return this.createAction(PointOfOrderCategoryAction.CREATE, payload);
    }

    public update(viewModel: any | any[], id?: Id): Action<void> {
        const models = Array.isArray(viewModel) ? viewModel : [viewModel];
        const payload: any[] = models.map(model => ({
            id: model.id ?? id,
            text: model.text,
            rank: model.rank
        }));
        return this.createAction(PointOfOrderCategoryAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Action<void> {
        const payload = ids.map(id => ({ id }));
        return this.createAction(PointOfOrderCategoryAction.DELETE, payload);
    }

    public listUpdate(data: ListUpdateData<PointOfOrderCategory>, meeting_id?: Id): Action<void | Identifiable> {
        return this.bulkUpdateCategories(data, meeting_id);
    }

    public bulkUpdateCategories(
        data: ListUpdateData<PointOfOrderCategory>,
        meeting_id?: Id
    ): Action<void | Identifiable> {
        return Action.from(
            ...(data.toDelete ? [this.delete(...data.toDelete)] : []),
            ...(data.toUpdate ? [this.update(data.toUpdate)] : []),
            ...(data.toCreate ? [this.create(data.toCreate, meeting_id)] : [])
        );
    }
}
