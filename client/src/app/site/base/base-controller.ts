import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { Id } from '../../domain/definitions/key-types';
import { BaseModel, ModelConstructor } from '../../domain/models/base/base-model';
import { BaseRepository } from '../../gateways/repositories/base-repository';
import { ControllerServiceCollectorService } from '../services/controller-service-collector.service';
import { BaseViewModel } from './base-view-model';

@Directive()
export abstract class BaseController<V extends BaseViewModel, M extends BaseModel> {
    public get translate(): TranslateService {
        return this.controllerServiceCollector.translate;
    }

    public get collection(): string {
        return this.repo.collection;
    }

    public constructor(
        protected controllerServiceCollector: ControllerServiceCollectorService,
        protected baseModelCtor: ModelConstructor<M>,
        protected repo: BaseRepository<V, M>
    ) {}

    public getViewModel(id: Id): V | null {
        return this.repo.getViewModel(id);
    }

    /**
     * Fetches a ViewModel without checking for accessibility.
     * Should therefore only be used in special cases where completely public attributes need to be checked.
     * (An example would be to display names of meetings that the user isn't in)
     */
    public getViewModelUnsafe(id: Id): V | null {
        return this.repo.getViewModelUnsafe(id);
    }

    public getViewModelObservable(id: Id): Observable<V | null> {
        return this.repo.getViewModelObservable(id);
    }

    public getViewModelList(): V[] {
        return this.repo.getViewModelList();
    }

    public getViewModelListObservable(): Observable<V[]> {
        return this.repo.getViewModelListObservable();
    }

    /**
     * Get a sorted ViewModelList. This may pass through a delay,
     * thus may not be accurate, especially on application loading.
     *
     * @returns all sorted view models stored in this repository sorted according to the SortListService with the given sorting key or by id if the sort service has been un-registered. Sorting is done according to sortFn if no sort key is given or the sort key id "default"
     */
    public getSortedViewModelList(key?: string): V[] {
        return this.repo.getSortedViewModelList(key);
    }

    /**
     * Get a sorted ViewModelListObservable. This may pass through a delay,
     * thus may not be accurate, especially on application loading.
     *
     * @returns all sorted view models stored in this repository sorted according to the SortListService with the given sorting key or by id if the sort service has been un-registered. Sorting is done according to sortFn if no sort key is given or the sort key id "default"
     */
    public getSortedViewModelListObservable(key?: string): Observable<V[]> {
        return this.repo.getSortedViewModelListObservable(key);
    }

    public getVerboseName = (plural?: boolean): string => {
        return this.repo.getVerboseName(plural);
    };
}
