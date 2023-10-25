import { Directive, inject, Injector, ProviderToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    auditTime,
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    isObservable,
    Observable
} from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { deepCopy } from 'src/app/infrastructure/utils/transform-functions';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { SortListService } from 'src/app/ui/modules/list/definitions/sort-service';

import { StorageService } from '../../../gateways/storage.service';
import { BaseViewModel } from '../base-view-model';
import { BaseSortService } from './base-sort.service';
import { OsHideSortingOptionSetting, OsSortingDefinition, OsSortingOption, OsSortProperty } from './os-sort';

/**
 * Base class for generic sorting purposes
 */
@Directive()
export abstract class BaseSortListService<V extends BaseViewModel>
    extends BaseSortService<V>
    implements SortListService<V>
{
    /**
     * The models own keys that the current sort option depends upon
     */
    public get currentSortBaseKeys(): OsSortProperty<V>[] {
        const option = this.sortOptions.find(option =>
            this.isSameProperty(option.property, this.sortDefinition.sortProperty)
        );
        return option.baseKeys ?? (Array.isArray(option.property) ? option.property : [option.property]);
    }

    /**
     * Othe models keys that the current sort option depends upon
     */
    public get currentForeignSortBaseKeys(): { [collection: string]: string[] } {
        const option = this.sortOptions.find(option =>
            this.isSameProperty(option.property, this.sortDefinition.sortProperty)
        );
        return option.foreignBaseKeys ?? {};
    }

    /**
     * Set the current sorting order
     *
     * @param ascending ascending sorting if true, descending sorting if false
     */
    public set ascending(ascending: boolean) {
        this.sortDefinition!.sortAscending = ascending;
        this.updateSortDefinitions();
    }

    /**
     * @returns wether current the sorting is ascending or descending
     */
    public get ascending(): boolean {
        return this.sortDefinition!.sortAscending;
    }

    public get hasSortOptionSelected(): boolean {
        const defaultDef = this._defaultDefinitionSubject.value;
        const current = this.sortDefinition;
        if (!defaultDef || !current) {
            return false;
        }
        return defaultDef.sortAscending !== current.sortAscending || defaultDef.sortProperty !== current.sortProperty;
    }

    /**
     * set the property of the viewModel the sorting will be based on.
     * If the property stays the same, only the sort direction will be toggled,
     * new sortProperty will result in an ascending order.
     *
     * @param property a part of a view model
     */
    public set sortProperty(property: OsSortProperty<V>) {
        if (this.getPropertiesEqual(this.sortDefinition!.sortProperty, property)) {
            this.ascending = !this.ascending;
        } else {
            this.sortDefinition!.sortProperty = property;
            this.sortDefinition!.sortAscending = true;
        }
        this.updateSortDefinitions();
        this.hasLoaded.resolve(true);
    }

    /**
     * @returns the current sorting property
     */
    public get sortProperty(): OsSortProperty<V> {
        return this.sortDefinition?.sortProperty;
    }

    /**
     * @returns wether sorting is active or not
     */
    public get isActive(): boolean {
        return this.sortOptions && this.sortOptions.length > 0;
    }

    public get sortOptions(): OsSortingOption<V>[] {
        const sortOptions = this.getSortOptions();
        if (sortOptions && sortOptions.length) {
            return sortOptions.filter(option => !this.shouldHideOption(option));
        }
        return [];
    }

    public get defaultOption(): OsSortingOption<V> | undefined {
        return this.getSortOptions().find(
            option =>
                this._defaultDefinitionSubject.value &&
                this.isSameProperty(option.property, this._defaultDefinitionSubject.value.sortProperty)
        );
    }

    /**
     * Resolves once there is a full sort definition saved within the sort service
     */
    public readonly hasLoaded = new Deferred<boolean>();

    /**
     * Updates every time when there's a new sortDefinition. Emits said sortDefinition.
     */
    public get sortingUpdatedObservable() {
        return this.sortDefinitionSubject.pipe(
            distinctUntilChanged((prev, curr) => {
                return JSON.stringify(prev) === JSON.stringify(curr);
            }),
            auditTime(5)
        );
    }

    /**
     * The key under which the sortedViewModelList of this service can be retreived from the repository.
     */
    public get repositorySortingKey(): string {
        return this.storageKey;
    }

    /**
     * The key to access stored valued
     */
    protected abstract readonly storageKey: string;

    /**
     * Injection token for the repository whose values should be sorted by this service.
     */
    protected abstract readonly repositoryToken: ProviderToken<BaseRepository<any, any>>;

    /**
     * The current sorting definitions
     */
    private sortDefinition: OsSortingDefinition<V> | null = null;

    private _defaultDefinitionSubject = new BehaviorSubject<OsSortingDefinition<V>>(null);

    private _isDefaultSorting = false;

    private sortDefinitionSubject = new BehaviorSubject<OsSortingDefinition<V> | null>(null);

    private get repository(): BaseRepository<any, any> {
        if (!this._repository) {
            this._repository = this.injector.get(this.repositoryToken);
        }
        return this._repository;
    }

    private _repository: BaseRepository<any, any>;

    private initializationCount = 0;

    private activeMeetingIdService = inject(ActiveMeetingIdService);

    public constructor(
        translate: TranslateService,
        private store: StorageService,
        private injector: Injector,
        defaultDefinition: OsSortingDefinition<V> | Observable<OsSortingDefinition<V>>
    ) {
        super(translate);

        this._defaultDefinitionSubject
            .pipe(distinctUntilChanged((prev, curr) => prev?.sortProperty === curr?.sortProperty))
            .subscribe(defaultDef => {
                if (this._isDefaultSorting && defaultDef) {
                    this.setSorting(defaultDef.sortProperty, defaultDef.sortAscending);
                } else if (defaultDef && this.sortDefinition?.sortProperty === defaultDef?.sortProperty) {
                    this.updateSortDefinitions();
                }
                if (!this.sortDefinition) {
                    this.loadDefinition();
                }
            });

        if (isObservable(defaultDefinition)) {
            defaultDefinition.subscribe(this._defaultDefinitionSubject);
        } else {
            this._defaultDefinitionSubject.next(defaultDefinition);
        }
        this.activeMeetingIdService.meetingIdChanged.subscribe(event => {
            if (event.nextMeetingId) {
                this.setSortingAfterMeetingChange(event.nextMeetingId);
            }
        });
    }

    /**
     * Defines the sorting properties and registers this service with the repository.
     * After this, calling the repositories `getSortedViewModelListObservable` will return an observable wherein the values are sorted according to this services sort definitions.
     *
     * exitSortService should be called when the sorting is not required anymore to ensure that the repository isn't doing any unnecessary sorting work.
     *
     * @param name arbitrary name, used to save/load correct saved settings from StorageService
     * @param definitions The definitions of the possible options
     */
    public async initSorting(): Promise<void> {
        if (this.initializationCount < 1) {
            this.repository.registerSortListService(this.storageKey, this);

            if (!this.sortDefinition) {
                await this.loadDefinition();
            }
        }
        this.initializationCount++;
    }

    /**
     * Unregisters this service with the repository if the sorting isn't still required somewhere else.
     * After this, the repositories `getSortedViewModelListObservable` will return the regular id-based-order until re-registration.
     */
    public exitSortService(): void {
        this.initializationCount--;
        if (this.initializationCount < 1) {
            this.repository.unregisterSortListService(this.storageKey);
        }
        if (this.initializationCount < 0) {
            this.initializationCount = 0;
        }
    }

    /**
     * Change the property and the sorting direction at the same time
     *
     * @param property a sorting property of a view model
     * @param ascending ascending or descending
     */
    public setSorting(property: OsSortProperty<V>, ascending: boolean): void {
        if (!this.sortDefinition) {
            this.sortDefinition = { sortProperty: property, sortAscending: ascending };
        } else {
            this.sortDefinition!.sortProperty = property;
            this.sortDefinition!.sortAscending = ascending;
            this.updateSortDefinitions();
        }
        this.hasLoaded.resolve(true);
    }

    /**
     * Retrieves the currently active icon for an option.
     *
     * @param option
     * @returns the name of the sorting icon, fit to material icon ligatures
     */
    public getSortIcon(option: OsSortingOption<V>): string | null {
        if (this.sortDefinition) {
            if (!this.sortProperty || !this.getPropertiesEqual(this.sortProperty, option.property)) {
                return ``;
            }
            return this.ascending ? `arrow_upward` : `arrow_downward`;
        } else {
            return null;
        }
    }

    /**
     * Determines and returns an untranslated sorting label as string
     *
     * @param option The sorting option to a ViewModel
     * @returns a sorting label as string
     */
    public getSortLabel(option: OsSortingOption<V>): string {
        if (option.label) {
            return option.label;
        }
        const itemProperty = option.property as string;
        return itemProperty.charAt(0).toUpperCase() + itemProperty.slice(1);
    }

    public isSameProperty(a: OsSortProperty<V>, b: OsSortProperty<V>): boolean {
        a = Array.isArray(a) ? a : [a];
        b = Array.isArray(b) ? b : [b];
        return a.equals(b);
    }

    /**
     * Sorts the given array according to this services sort settings and returns it.
     */
    public async sort(array: V[]): Promise<V[]> {
        const alternativeProperty = (await this.getDefaultDefinition()).sortProperty;
        return array.sort((itemA, itemB) => this.compareHelperFunction(itemA, itemB, alternativeProperty));
    }

    /**
     * Compare function that can be used to sort an array according to this services sort settings.
     * @returns a negative number if itemA is smaller than itemB, a positive number if itemB is smaller and 0 otherwise
     */
    public async compare(itemA: V, itemB: V): Promise<number> {
        const alternativeProperty = (await this.getDefaultDefinition()).sortProperty;
        return this.compareHelperFunction(itemA, itemB, alternativeProperty);
    }

    /**
     * Gets the sortedViewModelListObservable resulting from this services definitions from the corresponding repository.
     */
    public getSortedViewModelListObservable(): Observable<V[]> {
        return this.repository.getSortedViewModelListObservable(this.repositorySortingKey);
    }

    /**
     * Enforce children to implement a function that returns their sorting options
     */
    protected abstract getSortOptions(): OsSortingOption<V>[];

    protected getHideSortingOptionSettings(): OsHideSortingOptionSetting<V>[] {
        return [];
    }

    protected async getDefaultDefinition(): Promise<OsSortingDefinition<V>> {
        if (this._defaultDefinitionSubject.value) {
            return this._defaultDefinitionSubject.value;
        }
        return await firstValueFrom(this._defaultDefinitionSubject.pipe(filter(value => !!value)));
    }

    /**
     * Causes the chain reaction that leads to the list being resorted. Is supposed to be called on init and
     * every time the sorting (property, ascending/descending) or the language changes
     */
    protected async updateSortedData(): Promise<void> {
        this.sortDefinitionSubject.next(deepCopy(this.sortDefinition));
    }

    private shouldHideOption(option: OsSortingOption<V> | OsSortingDefinition<V>, update = true): boolean {
        let property = (option[`property`] ? option[`property`] : option[`sortProperty`]) as OsSortProperty<V>;
        if (!Array.isArray(property)) {
            property = [property];
        }
        let shouldHide = false;
        property.forEach(prop => {
            const setting = this.getHideSortingOptionSettings().find(setting => setting.property === prop);
            const settingHidden = setting ? setting.shouldHideFn() : false;
            shouldHide = shouldHide || settingHidden;
            if (setting && settingHidden !== setting.currentlyHidden && update) {
                setting.currentlyHidden = settingHidden;
                this.updateSortedData();
            }
        });
        return shouldHide;
    }

    private async loadDefinition(): Promise<void> {
        let [sortProperty, sortAscending]: [OsSortProperty<V>, boolean] = await Promise.all([
            this.store.get<OsSortProperty<V>>(this.calcStorageKey(`sorting_property`, this.storageKey)),
            this.store.get<boolean>(this.calcStorageKey(`sorting_ascending`, this.storageKey))
        ]);

        const defaultDef = await this.getDefaultDefinition();
        sortAscending = sortAscending ?? defaultDef.sortAscending;
        sortProperty = sortProperty ?? defaultDef.sortProperty;
        this.sortDefinition = {
            sortAscending,
            sortProperty
        };
        this.updateSortDefinitions();
        this.hasLoaded.resolve(true);
    }

    private async setSortingAfterMeetingChange(meetingId: Id): Promise<void> {
        let [sortProperty, sortAscending]: [OsSortProperty<V>, boolean] = await Promise.all([
            this.store.get<OsSortProperty<V>>(`sorting_property_${this.storageKey}_${meetingId}`),
            this.store.get<boolean>(`sorting_ascending_${this.storageKey}_${meetingId}`)
        ]);
        const defaultDef = await this.getDefaultDefinition();
        sortProperty = sortProperty ?? defaultDef.sortProperty;
        sortAscending = sortAscending ?? defaultDef.sortAscending;
        this.setSorting(sortProperty, sortAscending);
    }

    /**
     * Determines if the given properties are either the same property or both arrays of the same
     * properties.
     */
    private getPropertiesEqual(a: OsSortProperty<V>, b: OsSortProperty<V>): boolean {
        return Array.isArray(a) && Array.isArray(b) ? a.equals(b) : a === b;
    }

    private compareHelperFunction(itemA: V, itemB: V, alternativeProperty: OsSortProperty<V>): number {
        return (
            this.sortItems(
                itemA,
                itemB,
                this.shouldHideOption({ property: this.sortProperty }, false) ? alternativeProperty : this.sortProperty,
                this.ascending
            ) || itemA.id - itemB.id
        );
    }

    /**
     * Saves the current sorting definitions to the local store
     */
    private updateSortDefinitions(): void {
        this.calculateDefaultStatus();
        this.updateSortedData();
        if (this._isDefaultSorting) {
            this.store.remove(this.calcStorageKey(`sorting_property`, this.storageKey));
        } else {
            this.store.set(this.calcStorageKey(`sorting_property`, this.storageKey), this.sortDefinition?.sortProperty);
        }
        this.store.set(this.calcStorageKey(`sorting_ascending`, this.storageKey), this.sortDefinition?.sortAscending);
    }

    private calculateDefaultStatus(): void {
        this._isDefaultSorting = this.isSameProperty(
            this.sortDefinition.sortProperty,
            this._defaultDefinitionSubject.value?.sortProperty
        );
    }

    private calcStorageKey(prefix: string, storageKey: string): string {
        const possibleMeetingId = this.activeMeetingIdService.meetingId;
        if (possibleMeetingId) {
            return `${prefix}_${storageKey}_${possibleMeetingId}`;
        }
        return `${prefix}_${storageKey}`;
    }
}
