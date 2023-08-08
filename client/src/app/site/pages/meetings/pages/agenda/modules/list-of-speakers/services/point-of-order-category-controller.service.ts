import { Injectable } from '@angular/core';
import { PointOfOrderCategory } from 'src/app/domain/models/point-of-order-category/point-of-order-category';
import { PointOfOrderCategoryRepositoryService } from 'src/app/gateways/repositories/point-of-order-category/point-of-order-category-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPointOfOrderCategory } from '../view-models/view-point-of-order-category';

@Injectable({
    providedIn: `root`
})
export class PointOfOrderCategoryControllerService extends BaseMeetingControllerService<
    ViewPointOfOrderCategory,
    PointOfOrderCategory
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: PointOfOrderCategoryRepositoryService
    ) {
        super(controllerServiceCollector, PointOfOrderCategory, repo);
    }
}
