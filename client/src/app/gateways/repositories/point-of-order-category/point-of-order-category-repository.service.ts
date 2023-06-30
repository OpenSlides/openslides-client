import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { PointOfOrderCategory } from 'src/app/domain/models/point-of-order-category/point-of-order-category';
import { ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/view-models/view-point-of-order-category';

import { Action } from '../../actions';
import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { PointOfOrderCategoryAction } from './point-of-order-category.action';

@Injectable({
    providedIn: `root`
})
export class PointOfOrderCategoryRepositoryService extends BaseMeetingRelatedRepository<
    ViewPointOfOrderCategory,
    PointOfOrderCategory
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PointOfOrderCategory);
    }

    public getVerboseName = (plural?: boolean): string =>
        plural ? _(`Point of order categories`) : _(`Point of order category`);
    public getTitle = (viewModel: PointOfOrderCategory): string => viewModel.text;

    public create(pointOfOrderCategory: any, meeting_id: Id): Action<Identifiable> {
        const payload: any = {
            meeting_id: pointOfOrderCategory.meeting_id || meeting_id || this.activeMeetingId,
            text: pointOfOrderCategory.text,
            rank: pointOfOrderCategory.rank
        };
        return this.createAction(PointOfOrderCategoryAction.CREATE, payload);
    }

    public update(viewModel: any, id?: Id): Action<void> {
        const payload: any = {
            id: viewModel.id ?? id,
            text: viewModel.text,
            rank: viewModel.rank
        };
        return this.createAction(PointOfOrderCategoryAction.UPDATE, payload);
    }

    public delete(id: Id): Action<void> {
        const payload = { id };
        return this.createAction(PointOfOrderCategoryAction.DELETE, payload);
    }

    public bulkUpdateCategories(
        data: {
            toDelete: number[];
            toCreate: Partial<PointOfOrderCategory>[];
            toUpdate: Partial<PointOfOrderCategory>[];
        },
        meeting_id: Id
    ): Action<void | Identifiable> {
        return Action.from(
            ...data.toDelete.map(id => this.delete(id)),
            ...data.toUpdate.map(payload => this.update(payload)),
            ...data.toCreate.map(payload => this.create(payload, meeting_id))
        );
    }
}
