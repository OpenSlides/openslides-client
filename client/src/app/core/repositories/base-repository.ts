import { TranslateService } from '@ngx-translate/core';
import { HasCollection } from 'app/shared/models/base/collection';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';

import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseViewModel, ViewModelConstructor } from '../../site/base/base-view-model';
import { ActionRequest, ActionService } from '../core-services/action.service';
import { CollectionMapperService } from '../core-services/collection-mapper.service';
import { DataStoreService } from '../core-services/data-store.service';
import { Fieldsets } from '../core-services/model-request-builder.service';
import { RelationManagerService } from '../core-services/relation-manager.service';
import { ViewModelStoreService } from '../core-services/view-model-store.service';
import { HasViewModelListObservable } from '../definitions/has-view-model-list-observable';
import { Id } from '../definitions/key-types';
import { OnAfterAppsLoaded } from '../definitions/on-after-apps-loaded';
import { Relation } from '../definitions/relations';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from './repository-service-collector-without-active-meeting-service';

const RELATION_AS_OBSERVABLE_SUFFIX = `_as_observable`;

/**
 * Base repo for all collections. An overview of all observables and the flow of data:
 *
 * The data in the repos are **only** changed by the DSUpdateManager. During an autoupdate an
 * updateslot is opened (se datastore.service.ts). All changes are collected and afterwards
 * written to the repos with `deleteModels` and `changeModels`. Nothing else must call these
 * functions! To not flood the system with updates, this is done without publishing anything.
 * When this is done, the updateSlot gets committed and for each repo `commitUpdate` is called.
 * This issues controlled updates:
 *
 * - unsafeViewModelListSubject is triggered with the current list of unsafe view models. This list
 *   is not sorted. It is piped to `viewModelListSubject`, where the data is sorted.
 * - each changed or deleted model is published with `updateViewModelObservable`. This function
 *   published each (safe, accessible) viewmodel in `viewModelSubjects` and every view model in
 *   the `generalViewModelSubject`.
 *
 *
 */
export abstract class BaseRepository<V extends BaseViewModel, M extends BaseModel>
    implements OnAfterAppsLoaded, HasCollection, HasViewModelListObservable<V>
{
    /**
     * Stores all the viewModel in an object
     */
    protected viewModelStore: { [modelId: number]: V } = {};

    /**
     * Stores subjects to viewModels in a list
     */
    protected viewModelSubjects: { [modelId: number]: BehaviorSubject<V> } = {};

    /**
     * Observable subject for the whole list. These entries are unsorted, not piped through
     * auditTime and can contain unaccessible models. Just use this internally.
     *
     * It's used to debounce messages on the sortedViewModelListSubject
     */
    protected readonly unsafeViewModelListSubject: BehaviorSubject<V[]> = new BehaviorSubject<V[]>([]);

    /**
     * Observable subject for the sorted view model list. Only accessible models are in the list.
     *
     * All data is piped through an auditTime of 1ms. This is to prevent massive
     * updates, if e.g. an autoupdate with a lot motions come in. The result is just one
     * update of the new list instead of many unnecessary updates.
     */
    protected readonly viewModelListSubject: BehaviorSubject<V[]> = new BehaviorSubject<V[]>([]);

    /**
     * Observable subject for any changes of view models. Unaccessible view models are included.
     */
    protected readonly generalViewModelSubject: Subject<V> = new Subject<V>();

    /**
     * On every update of data, this observable contains a list of affected ids (changed and deleted).
     */
    protected readonly modifiedIdsSubject: Subject<Id[]> = new Subject<Id[]>();

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

    public constructor(
        private repositoryServiceCollector: RepositoryServiceCollectorWithoutActiveMeetingService,
        protected baseModelCtor: ModelConstructor<M>
    ) {
        this._collection = baseModelCtor.COLLECTION;

        this.relationManager.getRelationsForCollection(this.collection).forEach(relation => {
            this.relationsByKey[relation.ownField] = relation;
        });

        // All data is piped through an auditTime of 1ms. This is to prevent massive
        // updates, if e.g. an autoupdate with a lot motions come in. The result is just one
        // update of the new list instead of many unnecessary updates.
        this.unsafeViewModelListSubject.pipe(auditTime(1)).subscribe(models => {
            if (models) {
                this.updateViewModelListSubject(models);
            }
        });

        this.languageCollator = new Intl.Collator(this.translate.currentLang);
    }

    public onAfterAppsLoaded(): void {
        this.baseViewModelCtor = this.collectionMapperService.getViewModelConstructor(this.collection);
        this.DS.clearObservable.subscribe(removedCollections => {
            if (
                !removedCollections ||
                (Array.isArray(removedCollections) && removedCollections.includes(this.collection))
            ) {
                // "removedCollections" is available if collections to be cleared are specified.
                this.clearViewModelStore();
            }
        });
        this.translate.onLangChange.subscribe(change => {
            this.languageCollator = new Intl.Collator(change.lang);
            if (this.unsafeViewModelListSubject.value) {
                this.updateViewModelListSubject(this.unsafeViewModelListSubject.value);
            }
        });
    }

    public updateViewModelListSubject(viewModels: V[]): void {
        this.viewModelListSubject.next(
            viewModels
                ?.filter(m => m.canAccess())
                ?.tap(models => this.tapViewModels(models))
                ?.sort(this.viewModelSortFn)
        );
    }

    public getListTitle: (viewModel: V) => string = (viewModel: V) => this.getTitle(viewModel);

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
                // target is our viewModel and property the requested value: viewModel[property]
                let result: any; // This is what we have to resolve: viewModel[property] -> result
                const _model: M = target.getModel();
                const relation = typeof property === `string` ? this.relationsByKey[property] : null;

                let relationAsObservable = null;
                if (
                    typeof property === `string` &&
                    property.substr(-RELATION_AS_OBSERVABLE_SUFFIX.length) === RELATION_AS_OBSERVABLE_SUFFIX
                ) {
                    relationAsObservable =
                        this.relationsByKey[property.substr(0, property.length - RELATION_AS_OBSERVABLE_SUFFIX.length)];
                }

                // try to find a getter for property
                if (property in target) {
                    // iterate over prototype chain
                    let prototypeFunc = this.baseViewModelCtor;
                    let descriptor = null;
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
                } else if (relationAsObservable) {
                    result = this.relationManager.getObservableForRelation(_model, relationAsObservable);
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
    protected clearViewModelStore(): void {
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
     * Helper function to return one viewModel. It will be null, if the model is unaccessible.
     * To retrieve all view models use getViewModelUnsafe().
     */
    public getViewModel(id: Id): V | null {
        const model = this.viewModelStore[id];
        return model?.canAccess() ? model : null;
    }

    /**
     * Returns one view model, if it exists in the repository. It returns the model if it is known,
     * so it also includes inaccessible view models.
     */
    public getViewModelUnsafe(id: Id): V {
        return this.viewModelStore[id];
    }

    public getViewModelListUnsafeObservable(): Observable<V[]> {
        return this.unsafeViewModelListSubject.asObservable();
    }

    /**
     * @returns all accessible view models stored in this repository. Sorting is not guaranteed.
     */
    public getViewModelList(): V[] {
        return Object.values(this.viewModelStore).filter(m => m.canAccess());
    }

    /**
     * @returns all view models stored in this repository, even unaccessible. Sorting is not guaranteed.
     */
    public getViewModelListUnsafe(): V[] {
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
            this.viewModelSubjects[id] = new BehaviorSubject<V>(this.getViewModel(id));
        }
        return this.viewModelSubjects[id].asObservable();
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
     * This observable fires on every update once contains each changed id.
     */
    public getModifiedIdsObservable(): Observable<Id[]> {
        return this.modifiedIdsSubject.asObservable();
    }

    /**
     * Updates the ViewModel observable using a ViewModel corresponding to the id
     */
    protected updateViewModelObservable(id: Id): void {
        if (this.viewModelSubjects[id]) {
            this.viewModelSubjects[id].next(this.getViewModel(id));
        }
        this.generalViewModelSubject.next(this.getViewModelUnsafe(id));
    }

    /**
     * update the observable of the list. Also updates the sorting of the view model list.
     */
    public commitUpdate(modelIds: Id[]): void {
        this.unsafeViewModelListSubject.next(this.getViewModelListUnsafe());
        modelIds.forEach(id => {
            this.updateViewModelObservable(id);
        });
        this.modifiedIdsSubject.next(modelIds);
    }

    protected tapViewModels(_viewModels: V[]): void {}

    protected raiseError = (error: string | Error) => {
        this.repositoryServiceCollector.errorService.showError(error);
        throw error;
    };

    protected async sendActionToBackend<T>(action: string, payload: T): Promise<any> {
        try {
            return await this.actions.sendRequest(action, payload);
        } catch (e) {
            this.raiseError(e);
            throw e;
        }
    }

    protected async sendBulkActionToBackend<T>(action: string, payload: T[]): Promise<any> {
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
