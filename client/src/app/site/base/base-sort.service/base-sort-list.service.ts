import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SortListService } from 'src/app/ui/modules/list/definitions/sort-service';

import { StorageService } from '../../../gateways/storage.service';
import { BaseViewModel } from '../base-view-model';
import { BaseSortService } from './base-sort.service';
import { OsSortingDefinition, OsSortingOption, OsSortProperty } from './os-sort';

/**
 * Base class for generic sorting purposes
 */
@Directive()
export abstract class BaseSortListService<V extends BaseViewModel>
    extends BaseSortService<V>
    implements SortListService<V>
{
    /**
     * The data to be sorted. See also the setter for {@link data}
     */
    private inputData: V[] = [];

    /**
     * Subscription for the inputData list.
     * Acts as an semaphore for new filtered data
     */
    private inputDataSubscription: Subscription | null = null;

    /**
     * Observable output that submits the newly sorted data each time a sorting has been done
     */
    private outputSubject = new BehaviorSubject<V[]>([]);

    /**
     * @returns the sorted output subject as observable
     */
    public get outputObservable(): Observable<V[]> {
        return this.outputSubject.asObservable();
    }

    /**
     * The current sorting definitions
     */
    private sortDefinition: OsSortingDefinition<V> | null = null;

    /**
     * The key to access stored valued
     */
    protected abstract readonly storageKey: string;

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
    }

    /**
     * @returns the current sorting property
     */
    public get sortProperty(): OsSortProperty<V> {
        return this.sortDefinition!.sortProperty;
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
            return sortOptions;
        }
        return [];
    }

    public constructor(translate: TranslateService, private store: StorageService) {
        super(translate);
    }

    /**
     * Enforce children to implement a function that returns their sorting options
     */
    protected abstract getSortOptions(): OsSortingOption<V>[];

    /**
     * Enforce children to implement a method that returns the fault sorting
     */
    protected abstract getDefaultDefinition(): OsSortingDefinition<V> | Promise<OsSortingDefinition<V>>;

    /**
     * Defines the sorting properties, and returns an observable with sorted data
     *
     * @param name arbitrary name, used to save/load correct saved settings from StorageService
     * @param definitions The definitions of the possible options
     */
    public async initSorting(inputObservable: Observable<V[]>): Promise<void> {
        if (this.inputDataSubscription) {
            this.inputDataSubscription.unsubscribe();
            this.inputDataSubscription = null;
        }

        if (!this.sortDefinition) {
            const storedDefinition = await this.store.get<OsSortingDefinition<V>>(`sorting_` + this.storageKey);

            if (storedDefinition) {
                this.sortDefinition = storedDefinition;
            }

            if (this.sortDefinition && this.sortDefinition.sortProperty) {
                this.updateSortedData();
            } else {
                this.sortDefinition = await this.getDefaultDefinition();
                this.updateSortDefinitions();
            }
        }

        this.inputDataSubscription = inputObservable.subscribe(data => {
            this.inputData = data;
            this.updateSortedData();
        });
    }

    /**
     * Change the property and the sorting direction at the same time
     *
     * @param property a sorting property of a view model
     * @param ascending ascending or descending
     */
    public setSorting(property: keyof V, ascending: boolean): void {
        this.sortDefinition!.sortProperty = property;
        this.sortDefinition!.sortAscending = ascending;
        this.updateSortDefinitions();
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
     * Determines if the given properties are either the same property or both arrays of the same
     * properties.
     */
    private getPropertiesEqual(a: OsSortProperty<V>, b: OsSortProperty<V>): boolean {
        return Array.isArray(a) && Array.isArray(b) ? a.equals(b) : a === b;
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

    /**
     * Saves the current sorting definitions to the local store
     */
    private updateSortDefinitions(): void {
        this.updateSortedData();
        this.store.set(`sorting_` + this.storageKey, this.sortDefinition);
    }

    /**
     * Recreates the sorting function. Is supposed to be called on init and
     * every time the sorting (property, ascending/descending) or the language changes
     */
    protected updateSortedData(): void {
        if (this.inputData) {
            this.inputData.sort((itemA, itemB) => this.sortItems(itemA, itemB, this.sortProperty, this.ascending));
            this.outputSubject.next(this.inputData);
        }
    }
}
