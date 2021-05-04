import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { auditTime, filter } from 'rxjs/operators';

import { ActionRequest, ActionService } from '../core-services/action.service';
import { Collection } from 'app/shared/models/base/collection';
import { AuthService } from '../core-services/auth.service';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseViewModel, ViewModelConstructor } from '../../site/base/base-view-model';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import { DataStoreService } from '../core-services/data-store.service';
import { HasViewModelListObservable } from '../definitions/has-view-model-list-observable';
import { Id } from '../definitions/key-types';
import { Fieldsets } from '../core-services/model-request-builder.service';
import { OnAfterAppsLoaded } from '../definitions/on-after-apps-loaded';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { Relation } from '../definitions/relations';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from './repository-service-collector-without-active-meeting-service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';

export abstract class BaseRepository<V extends BaseViewModel, M extends BaseModel>
    implements OnAfterAppsLoaded, Collection, HasViewModelListObservable<V> {
    /**
     * Stores all the viewModel in an object
     */
    protected viewModelStore: { [modelId: number]: V } = {};

    /**
     * Stores subjects to viewModels in a list
     */
    protected viewModelSubjects: { [modelId: number]: BehaviorSubject<V> } = {};

    /**
     * Observable subject for the whole list. These entries are unsorted and not piped through
     * auditTime. Just use this internally.
     *
     * It's used to debounce messages on the sortedViewModelListSubject
     */
    protected readonly unsafeViewModelListSubject: BehaviorSubject<V[]> = new BehaviorSubject<V[]>(null);

    /**
     * Observable subject for the sorted view model list.
     *
     * All data is piped through an auditTime of 1ms. This is to prevent massive
     * updates, if e.g. an autoupdate with a lot motions come in. The result is just one
     * update of the new list instead of many unnecessary updates.
     */
    protected readonly viewModelListSubject: BehaviorSubject<V[]> = new BehaviorSubject<V[]>([]);

    /**
     * Observable subject for any changes of view models.
     */
    protected readonly generalViewModelSubject: Subject<V> = new Subject<V>();

    /**
     * Can be used by the sort functions.
     */
    protected languageCollator: Intl.Collator;

    /**
     * The collection string of the managed model.
     */
    private _collection: string;

    public get collection(): string {
        return this._collection;
    }

    /**
     * Needed for the collectionMapper service to treat repositories the same as
     * ModelConstructors and ViewModelConstructors.
     */
    public get COLLECTION(): string {
        return this._collection;
    }

    public abstract getVerboseName: (plural?: boolean) => string;
    public abstract getTitle: (viewModel: V) => string;

    /**
     * Maps the given relations (`relationDefinitions`) to their affected collections. This means,
     * if a model of the collection updates, the relation needs to be updated.
     *
     * Attention: Some inherited repos might put other relations than RelationDefinition in here, so
     * *always* check the type of the relation.
     */
    /*protected relationsByCollection: { [collection: string]: RelationDefinition<BaseViewModel>[] } = {};

    protected reverseRelationsByCollection: { [collection: string]: ReverseRelationDefinition<BaseViewModel>[] } = {};*/

    protected relationsByKey: { [key: string]: Relation } = {};

    /**
     * The view model ctor of the encapsulated view model.
     */
    protected baseViewModelCtor: ViewModelConstructor<V>;

    protected get DS(): DataStoreService {
        return this.repositoryServiceCollector.DS;
    }

    protected get actions(): ActionService {
        return this.repositoryServiceCollector.actionService;
    }

    protected get collectionMapperService(): CollectionMapperService {
        return this.repositoryServiceCollector.collectionMapperService;
    }

    protected get viewModelStoreService(): ViewModelStoreService {
        return this.repositoryServiceCollector.viewModelStoreService;
    }

    protected get translate(): TranslateService {
        return this.repositoryServiceCollector.translate;
    }

    protected get relationManager(): RelationManagerService {
        return this.repositoryServiceCollector.relationManager;
    }

    protected get authService(): AuthService {
        return this.repositoryServiceCollector.authService;
    }

    public constructor(
        private repositoryServiceCollector: RepositoryServiceCollectorWithoutActiveMeetingService,
        protected baseModelCtor: ModelConstructor<M>
    ) {
        this._collection = baseModelCtor.COLLECTION;

        this.relationManager.getRelationsForCollection(this.collection).forEach(relation => {
            this.relationsByKey[relation.ownField] = relation;
        });

        this.authService.onLogout.subscribe(() => this.DS.clear());

        // All data is piped through an auditTime of 1ms. This is to prevent massive
        // updates, if e.g. an autoupdate with a lot motions come in. The result is just one
        // update of the new list instead of many unnecessary updates.
        this.unsafeViewModelListSubject.pipe(auditTime(1)).subscribe(models => {
            if (models) {
                this.viewModelListSubject.next(models.sort(this.viewModelSortFn));
            }
        });

        this.languageCollator = new Intl.Collator(this.translate.currentLang);
    }

    public onAfterAppsLoaded(): void {
        this.baseViewModelCtor = this.collectionMapperService.getViewModelConstructor(this.collection);
        this.DS.clearObservable.subscribe(() => this.clear());
        this.translate.onLangChange.subscribe(change => {
            this.languageCollator = new Intl.Collator(change.lang);
            if (this.unsafeViewModelListSubject.value) {
                this.viewModelListSubject.next(this.unsafeViewModelListSubject.value.sort(this.viewModelSortFn));
            }
        });
    }

    public getListTitle: (viewModel: V) => string = (viewModel: V) => {
        return this.getTitle(viewModel);
    };

    /**
     * Deletes all models from the repository (internally, no requests). Changes need
     * to be committed via `commitUpdate()`.
     *
     * @param ids All model ids
     */
    public deleteModels(ids: Id[]): void {
        ids.forEach(id => {
            delete this.viewModelStore[id];
        });
    }

    /**
     * Updates or creates all given models in the repository (internally, no requests).
     * Changes need to be committed via `commitUpdate()`.
     *
     * @param ids All model ids.
     */
    public changedModels(ids: Id[]): void {
        ids.forEach(id => {
            this.viewModelStore[id] = this.createViewModel(this.DS.get(this.collection, id));
        });
    }

    /**
     * After creating a view model, all functions for models from the repo
     * are assigned to the new view model.
     */
    protected createViewModel(model: M): V {
        const viewModel = this.createViewModelProxy(model);

        viewModel.getTitle = () => this.getTitle(viewModel);
        viewModel.getListTitle = () => this.getListTitle(viewModel);
        viewModel.getVerboseName = this.getVerboseName;
        return viewModel;
    }

    private createViewModelProxy(model: M): V {
        let viewModel = new this.baseViewModelCtor(model);
        viewModel = new Proxy(viewModel, {
            get: (target: V, property) => {
                // target is our viewModel and property the requsted value: viewModel[property]
                let result: any; // This is what we have to resolve: viewModel[property] -> result
                const _model: M = target.getModel();
                const relation = typeof property === 'string' ? this.relationsByKey[property] : null;

                // try to find a getter for property
                if (property in target) {
                    // iterate over prototype chain
                    let prototypeFunc = this.baseViewModelCtor,
                        descriptor = null;
                    do {
                        descriptor = Object.getOwnPropertyDescriptor(prototypeFunc.prototype, property);
                        if (!descriptor || !descriptor.get) {
                            prototypeFunc = Object.getPrototypeOf(prototypeFunc);
                        }
                    } while (!(descriptor && descriptor.get) && prototypeFunc && prototypeFunc.prototype);

                    if (descriptor && descriptor.get) {
                        // if getter was found in prototype chain, bind it with this proxy for right `this` access
                        result = descriptor.get.bind(viewModel)();
                    } else {
                        result = target[property];
                    }
                } else if (property in _model) {
                    result = _model[property];
                } else if (relation) {
                    result = this.relationManager.handleRelation(_model, relation);
                }
                return result;
            }
        });
        return viewModel;
    }

    public abstract getFieldsets(): Fieldsets<any>;

    /**
     * Clears the repository.
     */
    protected clear(): void {
        this.viewModelStore = {};
    }
    /**
     * The function used for sorting the data of this repository. The default sorts by ID.
     */
    protected viewModelSortFn: (a: V, b: V) => number = (a: V, b: V) => a.id - b.id;

    /**
     * Setter for a sort function. Updates the sorting.
     *
     * @param fn a sort function
     */
    public setSortFunction(fn: (a: V, b: V) => number): void {
        this.viewModelSortFn = fn;
        this.commitUpdate(Object.keys(this.viewModelSubjects).map(x => +x));
    }

    /**
     * helper function to return one viewModel
     */
    public getViewModel(id: Id): V {
        return this.viewModelStore[id];
    }

    /**
     * @returns all view models stored in this repository. Sorting is not guaranteed
     */
    public getViewModelList(): V[] {
        return Object.values(this.viewModelStore);
    }

    /**
     * Get a sorted ViewModelList. This passes through a (1ms short) delay,
     * thus may not be accurate, especially on application loading.
     *
     * @returns all sorted view models stored in this repository.
     */
    public getSortedViewModelList(): V[] {
        return this.viewModelListSubject.getValue();
    }

    /**
     * @returns the current observable for one viewModel
     */
    public getViewModelObservable(id: Id): Observable<V> {
        if (!this.viewModelSubjects[id]) {
            this.viewModelSubjects[id] = new BehaviorSubject<V>(this.viewModelStore[id]);
        }
        return this.viewModelSubjects[id].pipe(filter(value => !!value));
    }

    /**
     * @returns the (sorted) Observable of the whole store.
     */
    public getViewModelListObservable(): Observable<V[]> {
        return this.viewModelListSubject.asObservable();
    }

    /**
     * Returns the ViewModelList as piped Behavior Subject.
     * Prevents unnecessary calls.
     *
     * @returns A subject that holds the model list
     */
    public getViewModelListBehaviorSubject(): BehaviorSubject<V[]> {
        return this.viewModelListSubject;
    }

    /**
     * This observable fires every time an object is changed in the repository.
     */
    public getGeneralViewModelObservable(): Observable<V> {
        return this.generalViewModelSubject.asObservable();
    }

    /**
     * Updates the ViewModel observable using a ViewModel corresponding to the id
     */
    protected updateViewModelObservable(id: Id): void {
        if (this.viewModelSubjects[id]) {
            this.viewModelSubjects[id].next(this.viewModelStore[id]);
        }
        this.generalViewModelSubject.next(this.viewModelStore[id]);
    }

    /**
     * update the observable of the list. Also updates the sorting of the view model list.
     */
    public commitUpdate(modelIds: Id[]): void {
        this.unsafeViewModelListSubject.next(this.getViewModelList());
        modelIds.forEach(id => {
            this.updateViewModelObservable(id);
        });
    }

    protected raiseError = (error: string | Error) => {
        this.repositoryServiceCollector.errorService.showError(error);
        throw error;
    };

    protected async sendActionToBackend(action: string, payload: any): Promise<any> {
        try {
            return await this.actions.sendRequest(action, payload);
        } catch (e) {
            this.raiseError(e);
            throw e;
        }
    }

    protected async sendBulkActionToBackend(action: string, payload: any[]): Promise<any> {
        try {
            return await this.actions.sendBulkRequest(action, payload);
        } catch (e) {
            this.raiseError(e);
            throw e;
        }
    }

    protected async sendActionsToBackend(actions: ActionRequest[]): Promise<any> {
        try {
            return await this.actions.sendRequests(actions);
        } catch (e) {
            this.raiseError(e);
            throw e;
        }
    }
}
