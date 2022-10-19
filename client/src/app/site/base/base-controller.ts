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

    public getVerboseName = (plural?: boolean): string => {
        return this.repo.getVerboseName(plural);
    };
}
