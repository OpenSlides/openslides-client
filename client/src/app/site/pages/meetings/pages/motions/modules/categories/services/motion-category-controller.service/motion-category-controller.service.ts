import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionCategory } from 'src/app/domain/models/motions/motion-category';
import { Action } from 'src/app/gateways/actions';
import { MotionCategoryRepositoryService } from 'src/app/gateways/repositories/motions';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { ViewMotionCategory } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionCategoryControllerService extends BaseMeetingControllerService<ViewMotionCategory, MotionCategory> {
    private readonly _currentCategoriesSubject = new BehaviorSubject<ViewMotionCategory[]>([]);

    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MotionCategoryRepositoryService,
        private treeService: TreeService
    ) {
        super(controllerServiceCollector, MotionCategory, repo);
        repo.getViewModelListObservable().subscribe(categories =>
            this._currentCategoriesSubject.next(this.createCategoriesTree(categories))
        );
    }

    public override getViewModelList(): ViewMotionCategory[] {
        return this._currentCategoriesSubject.value;
    }

    public override getViewModelListObservable(): Observable<ViewMotionCategory[]> {
        return this._currentCategoriesSubject;
    }

    public create(...categories: Partial<MotionCategory>[]): Promise<Identifiable[]> {
        return this.repo.create(...categories);
    }

    public update(update: Partial<MotionCategory>, category: Identifiable): Promise<void> {
        return this.repo.update(update, category);
    }

    public delete(...categories: Identifiable[]): Promise<void> {
        return Action.from(...categories.map(category => this.repo.delete(category))).resolve() as Promise<void>;
    }

    public numberMotionsInCategory(category: Identifiable): Promise<void> {
        return this.repo.numberMotionsInCategory(category);
    }

    public sortCategories(tree: TreeIdNode[]): Promise<void> {
        return this.repo.sortCategories(tree);
    }

    public sortMotionsInCategory(category: Identifiable, motionIds: Ids): Promise<void> {
        return this.repo.sortMotionsInCategory(category, motionIds);
    }

    private createCategoriesTree(categories: ViewMotionCategory[]): ViewMotionCategory[] {
        return this.treeService.makeFlatTree(categories, `weight`, `parent_id`);
    }
}
