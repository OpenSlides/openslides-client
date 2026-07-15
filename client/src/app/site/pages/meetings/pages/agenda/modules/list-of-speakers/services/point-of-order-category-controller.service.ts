import { inject, Service } from '@angular/core';
import { PointOfOrderCategory } from '@app/domain/models/point-of-order-category/point-of-order-category';
import { PointOfOrderCategoryRepositoryService } from '@app/gateways/repositories/point-of-order-category/point-of-order-category-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewPointOfOrderCategory } from '../view-models/view-point-of-order-category';

@Service()
export class PointOfOrderCategoryControllerService extends BaseMeetingControllerService<
    ViewPointOfOrderCategory,
    PointOfOrderCategory
> {
    protected override repo: PointOfOrderCategoryRepositoryService;

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repoForSuper = inject(PointOfOrderCategoryRepositoryService);
        super(controllerServiceCollector, PointOfOrderCategory, repoForSuper);
        this.repo = repoForSuper;
    }
}
