import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { columnFactory, createDS, DataSourcePredicate, PblDataSource, PblNgridComponent } from '@pebula/ngrid';
import { PblColumnDefinition, PblColumnFactory, PblNgridColumnSet } from '@pebula/ngrid/lib/grid';
import { PblNgridDataMatrixRow } from '@pebula/ngrid/target-events';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { OperatorService, Permission } from 'app/core/core-services/operator.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { HasViewModelListObservable } from 'app/core/definitions/has-view-model-list-observable';
import { BaseFilterListService } from 'app/core/ui-services/base-filter-list.service';
import { BaseSortListService } from 'app/core/ui-services/base-sort-list.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { BaseModel } from 'app/shared/models/base/base-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { isProjectable, Projectable } from 'app/site/base/projectable';
import { HasListOfSpeakers, hasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';

export interface CssClassDefinition {
    [key: string]: boolean;
}

/**
 * To hide columns via restriction
 */
export interface ColumnRestriction {
    columnName: string;
    permission: Permission;
}

/**
 * Powerful list view table component.
 *
 * Creates a sort-filter-bar and table with virtual scrolling, where projector and multi select is already
 * embedded
 *
 * Takes a repository-service (or simple Observable), a sort-service and a filter-service as an input to display data
 * Requires multi-select information
 * Double binds selected rows
 *
 * required both columns definition and a transclusion slot using the ".columns" slot as selector
 *
 * Can inform about changes in the DataSource
 *
 * !! Due to bugs in Firefox, ALL inputs to os-list-view-table need to be simple objects.
 *    NO getter, NO return of a function
 *    If otherwise more logic is required, use `changeDetectionStrategy.OnPush`
 *    in your component
 *
 * @example
 * ```html
 * <os-list-view-table
 *     [listObservableProvider]="motionRepo"
 *     [filterService]="filterService"
 *     [filterProps]="filterProps"
 *     [sortService]="sortService"
 *     [columns]="motionColumnDefinition"
 *     [restricted]="restrictedColumns"
 *     [hiddenInMobile]="['state']"
 *     [allowProjector]="false"
 *     [multiSelect]="isMultiSelect"
 *     listStorageKey="motion"
 *     [(selectedRows)]="selectedRows"
 *     (dataSourceChange)="onDataSourceChange($event)"
 * >
 *     <div *pblNgridCellDef="'number'; row as motion" class="cell-slot">
 *         {{ motion.number }}
 *     </div>
 * </os-list-view-table>
 * ```
 */
@Component({
    selector: 'os-list-view-table',
    templateUrl: './list-view-table.component.html',
    styleUrls: ['./list-view-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ListViewTableComponent<V extends BaseViewModel, M extends BaseModel> implements OnInit, OnDestroy {
    /**
     * Declare the table
     */
    @ViewChild(PblNgridComponent)
    private ngrid: PblNgridComponent;

    /**
     * The required repository (prioritized over listObservable)
     */
    @Input()
    public listObservableProvider: HasViewModelListObservable<V>;

    /**
     * ...or the required observable
     */
    @Input()
    public listObservable: Observable<V[]>;

    /**
     * The currently active sorting service for the list view
     */
    @Input()
    public sortService: BaseSortListService<V>;

    /**
     * The currently active filter service for the list view. It is supposed to
     * be a FilterListService extending FilterListService.
     */
    @Input()
    public filterService: BaseFilterListService<V>;

    /**
     * Current state of the multi select mode.
     */
    @Input()
    public multiSelect = false;

    /**
     * If a Projector column should be shown (at all)
     */
    @Input()
    private allowProjector = true;

    /**
     * columns to hide in mobile mode
     */
    @Input()
    public hiddenInMobile: string[];

    /**
     * To hide columns for users with insufficient permissions
     */
    @Input()
    public restricted: ColumnRestriction[];

    /**
     * An array of currently selected items, upon which multi select actions can be performed
     * see {@link selectItem}.
     */
    @Input()
    private selectedRows: V[];

    /**
     * Double binding the selected rows
     */
    @Output()
    private selectedRowsChange = new EventEmitter<V[]>();

    /**
     * The specific column definition to display in the table
     */
    @Input()
    public columns: PblColumnDefinition[] = [];

    /**
     * Properties to filter for
     */
    @Input()
    public filterProps: string[];

    /**
     * Key to restore scroll position after navigating
     */
    @Input()
    public listStorageKey: string;

    /**
     * Wether or not to show the filter bar
     */
    @Input()
    public showFilterBar = true;

    /**
     * If the menu should always be shown
     */
    @Input()
    public alwaysShowMenu = false;

    /**
     * If the speaker tab should appear
     */
    @Input()
    public showListOfSpeakers = true;

    /**
     * To optionally hide the menu slot
     */
    @Input()
    public showMenu = true;

    /**
     * Fix value for the height of the rows in the virtual-scroll-list.
     */
    @Input()
    public vScrollFixed = 110;

    /**
     * Determines whether the table should have a fixed 100vh height or not.
     * If not, the height must be set by the component
     */
    @Input()
    public fullScreen = true;

    @Input()
    public getProjectorButtonObject: (viewModel: V) => Projectable | null = null;

    @Input()
    public getSpeakerButtonObject: (viewModel: V) => (BaseViewModel & HasListOfSpeakers) | null = null;

    /**
     * Option to apply additional classes to the virtual-scrolling-list.
     */
    @Input()
    public set cssClasses(values: CssClassDefinition) {
        this._cssClasses = values;
    }

    /**
     * Returns the list of classes, that are applied to the virtual-scrolling-list.
     * Already prepared for the `[ngClass]`-property.
     *
     * `Warning: The defaultClasses will overwrite custom classes with the same key.`
     *
     * @returns An object looking like `{ [key: string]: boolean }`.
     */
    public get cssClasses(): CssClassDefinition {
        const defaultClasses = {
            'virtual-scroll-with-head-bar ngrid-hide-head': this.fullScreen && this.showFilterBar,
            'virtual-scroll-full-page': this.fullScreen && !this.showFilterBar,
            multiselect: this.multiSelect
        };
        return Object.assign(this._cssClasses, defaultClasses);
    }

    /**
     * Inform about changes in the dataSource
     */
    @Output()
    public dataSourceChange = new EventEmitter<PblDataSource<V>>();

    /**
     * Table data source
     */
    public dataSource: PblDataSource<V>;

    /**
     * Observable to the raw data
     */
    private dataListObservable: Observable<V[]>;

    /**
     * Minimal column width
     */
    private columnMinWidth = '60px';

    /**
     * The column set to display in the table
     */
    public columnSet: PblNgridColumnSet;

    /**
     * To dynamically recreate the columns
     */
    public columnFactory: PblColumnFactory;

    /**
     * Check if mobile and required semaphore for change detection
     */
    public isMobile: boolean;

    /**
     * Search input value
     */
    public inputValue: string;

    /**
     * Private variable to hold all classes for the virtual-scrolling-list.
     */
    private _cssClasses: CssClassDefinition = {};

    /**
     * Collect subsciptions
     */
    private subs: Subscription[] = [];

    /**
     * Most, of not all list views require these
     */
    private get defaultStartColumns(): PblColumnDefinition[] {
        const columns = [
            {
                prop: 'selection',
                label: '',
                width: '40px'
            },
            {
                prop: 'projector',
                label: '',
                width: this.columnMinWidth
            }
        ];
        return columns;
    }

    /**
     * End columns
     */
    private get defaultEndColumns(): PblColumnDefinition[] {
        const columns = [
            {
                prop: 'speaker',
                label: '',
                width: '45px'
            },
            {
                prop: 'menu',
                label: '',
                width: '40px'
            }
        ];

        return columns;
    }

    /**
     * Gets the amount of filtered data
     */
    public get countFilter(): number {
        return this.dataSource.filteredData.length;
    }

    /**
     * @returns The total length of the data-source.
     */
    public get totalCount(): number {
        return this.dataSource.length;
    }

    /**
     * Define which columns to hide. Uses the input-property
     * "hide" to hide individual columns
     */
    public get hiddenColumns(): string[] {
        let hidden: string[] = [];

        if (!this.multiSelect) {
            hidden.push('selection');
        }

        if ((!this.alwaysShowMenu && !this.isMobile) || !this.showMenu) {
            hidden.push('menu');
        }

        // hide the projector columns
        if (
            this.multiSelect ||
            this.isMobile ||
            !this.allowProjector ||
            !this.operator.hasPerms('core.can_manage_projector')
        ) {
            hidden.push('projector');
        }

        // hide the speakers in mobile
        if (this.isMobile || !this.operator.hasPerms('agenda.can_see_list_of_speakers') || !this.showListOfSpeakers) {
            hidden.push('speaker');
        }

        // hide all columns with restrictions
        if (this.restricted && this.restricted.length) {
            const restrictedColumns = this.restricted
                .filter(restriction => !this.operator.hasPerms(restriction.permission))
                .map(restriction => restriction.columnName);
            hidden = hidden.concat(restrictedColumns);
        }

        // define columns that are hidden in mobile
        if (this.isMobile && this.hiddenInMobile && this.hiddenInMobile.length) {
            hidden = hidden.concat(this.hiddenInMobile);
        }

        return hidden;
    }

    /**
     * Yep it's a constructor.
     *
     * @param store: Access the scroll storage key
     */
    public constructor(
        private operator: OperatorService,
        vp: ViewportService,
        router: Router,
        private store: StorageService,
        private cd: ChangeDetectorRef
    ) {
        vp.isMobileSubject.subscribe(mobile => {
            if (mobile !== this.isMobile) {
                this.cd.markForCheck();
            }
            this.isMobile = mobile;
        });

        this.subs.push(
            router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => {
                this.saveScrollOffset();
            })
        );
    }

    public async ngOnInit(): Promise<void> {
        this.getListObservable();
        await this.restoreSearchQuery();
        this.createDataSource();
        this.changeRowHeight();
        this.cd.detectChanges();
        // ngrid exists after the first change detection
        this.scrollToPreviousPosition();
    }

    /**
     * Stop the change detection
     */
    public ngOnDestroy(): void {
        this.cd.detach();
        for (const sub of this.subs) {
            sub.unsubscribe();
        }
        this.subs = [];
    }

    /**
     * Function to create the DataSource
     */
    private createDataSource(): void {
        this.dataSource = createDS<V>()
            .onTrigger(() => (this.dataListObservable ? this.dataListObservable : []))
            .create();

        // inform listening components about changes in the data source
        this.dataSource.onSourceChanged.subscribe(() => {
            this.dataSourceChange.next(this.dataSource);
            this.checkSelection();
        });

        // data selection
        this.dataSource.selection.changed.subscribe(selection => {
            this.selectedRows = selection.source.selected;
            this.selectedRowsChange.emit(this.selectedRows);
        });

        // Define the columns. Has to be in the OnInit cause "columns" is slower than
        // the constructor of this class
        this.columnSet = columnFactory()
            .default({ width: this.columnMinWidth })
            .table(...this.defaultStartColumns, ...this.columns, ...this.defaultEndColumns)
            .build();

        this.dataSource.setFilter(this.getFilterPredicate());

        // refresh the data source if the filter changed
        if (this.filterService) {
            this.subs.push(
                this.filterService.outputObservable.pipe(distinctUntilChanged()).subscribe(() => {
                    this.dataSource.refresh();
                })
            );
        }

        // refresh the data source if the sorting changed
        if (this.sortService) {
            this.subs.push(
                this.sortService.outputObservable.subscribe(() => {
                    this.dataSource.refresh();
                })
            );
        }
    }

    /**
     * Determines and sets the raw data as observable lists according
     * to the used search and filter services
     */
    private getListObservable(): void {
        if (this.listObservableProvider || this.listObservable) {
            const listObservable = this.listObservableProvider
                ? this.listObservableProvider.getViewModelListObservable()
                : this.listObservable;
            if (this.filterService && this.sortService) {
                // filtering and sorting
                this.filterService.initFilters(listObservable);
                this.sortService.initSorting(this.filterService.outputObservable);
                this.dataListObservable = this.sortService.outputObservable;
            } else if (this.filterService) {
                // only filter service
                this.filterService.initFilters(listObservable);
                this.dataListObservable = this.filterService.outputObservable;
            } else if (this.sortService) {
                // only sorting
                this.sortService.initSorting(listObservable);
                this.dataListObservable = this.sortService.outputObservable;
            } else {
                // none of both
                this.dataListObservable = listObservable;
            }
        }
    }

    /**
     * Receive manual view updates
     */
    public viewUpdateEvent(): void {
        this.cd.markForCheck();
    }

    /**
     * @returns the filter predicate object
     */
    private getFilterPredicate(): DataSourcePredicate {
        return (item: V): boolean => {
            if (!this.inputValue) {
                return true;
            }

            // filter by ID
            const trimmedInput = this.inputValue.trim().toLowerCase();
            const idString = '' + item.id;
            const foundId = idString.trim().toLowerCase().indexOf(trimmedInput) !== -1;
            if (foundId) {
                return true;
            }

            // custom filter predicates
            if (this.filterProps && this.filterProps.length) {
                for (const prop of this.filterProps) {
                    // find nested props
                    const split = prop.split('.');
                    let currValue: any = item;
                    for (const subProp of split) {
                        if (currValue) {
                            currValue = currValue[subProp];
                        }
                    }

                    if (currValue) {
                        let propertyAsString = '';
                        // If the property is a function, call it.
                        if (typeof currValue === 'function') {
                            propertyAsString = '' + currValue();
                        } else if (currValue.constructor === Array) {
                            propertyAsString = currValue.join('');
                        } else {
                            propertyAsString = '' + currValue;
                        }

                        if (propertyAsString) {
                            const foundProp = propertyAsString.trim().toLowerCase().indexOf(trimmedInput) !== -1;

                            if (foundProp) {
                                return true;
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Generic click handler for rows. Allow so (multi) select anywhere
     * @param event the clicked row
     */
    public onSelectRow(event: PblNgridDataMatrixRow<V>): void {
        if (this.multiSelect) {
            const clickedModel: V = event.row;
            const alreadySelected = this.dataSource.selection.isSelected(clickedModel);
            if (alreadySelected) {
                this.dataSource.selection.deselect(clickedModel);
            } else {
                this.dataSource.selection.select(clickedModel);
            }
        }
    }

    /**
     * @param viewModel The model of the table
     * @returns a view model that can be projected
     */
    public _getProjectorButtonObject(viewModel: V): Projectable | null {
        if (this.getProjectorButtonObject === null) {
            if (isProjectable(viewModel)) {
                return viewModel;
            }
        } else {
            return this.getProjectorButtonObject(viewModel);
        }
    }

    public _getSpeakerButtonObject(viewModel: V): (BaseViewModel & HasListOfSpeakers) | null {
        if (this.getSpeakerButtonObject === null) {
            if (hasListOfSpeakers(viewModel)) {
                return viewModel;
            }
        } else {
            return this.getSpeakerButtonObject(viewModel);
        }
    }

    /**
     * Central search/filter function. Can be extended and overwritten by a filterPredicate.
     * Functions for that are usually called 'setFulltextFilter'
     *
     * @param event the string to search for
     */
    public searchFilter(filterValue: string): void {
        if (this.listStorageKey) {
            this.saveSearchQuery(this.listStorageKey, filterValue);
        }
        this.inputValue = filterValue;
        this.dataSource.syncFilter();
    }

    /**
     * Loads the scroll-index from the storage
     *
     * @param key the key of the scroll index
     * @returns the scroll index or 0 if not found
     */
    private async getScrollOffset(key: string): Promise<number> {
        const scrollOffset = await this.store.get<number>(`scroll_${key}`);
        return scrollOffset ? scrollOffset : 0;
    }

    /**
     * Store the scroll offset
     */
    private saveScrollOffset(): void {
        const offset = this.ngrid.viewport.measureScrollOffset();
        this.store.set(`scroll_${this.listStorageKey}`, offset);
    }

    /**
     * Saves the given query to restore it later, if navigating to other sites happened.
     *
     * @param key The `StorageKey` for the list-view.
     * @param query The query, that should be stored.
     */
    public saveSearchQuery(key: string, query: string): void {
        this.store.set(`query_${key}`, query);
    }

    /**
     * Function to load any query from the store for the given `StorageKey`.
     *
     * @param key The `StorageKey` for the list-view.
     */
    public async restoreSearchQuery(): Promise<void> {
        this.inputValue = await this.store.get<string>(`query_${this.listStorageKey}`);
    }

    /**
     * Automatically scrolls to a stored scroll position
     */
    private async scrollToPreviousPosition(): Promise<void> {
        if (this.ngrid) {
            const scrollIndex = await this.getScrollOffset(this.listStorageKey);
            this.ngrid.viewport.scrollToOffset(scrollIndex);
        }
    }

    /**
     * This function changes the height of the row for virtual-scrolling in the relating `.scss`-file.
     */
    private changeRowHeight(): void {
        if (this.vScrollFixed > 0) {
            document.documentElement.style.setProperty('--pbl-height', this.vScrollFixed + 'px');
        }
    }

    /**
     * Checks the array of selected items against the datastore data. This is
     * meant to reselect items by their id even if some of their data changed,
     * and to remove selected data that don't exist anymore.
     * To be called after an update of data. Checks if updated selected items
     * are still present in the dataSource, and (re-)selects them. This should
     * be called as the observed datasource updates.
     */
    protected checkSelection(): void {
        if (this.multiSelect) {
            const previouslySelectedRows = [];
            this.selectedRows.forEach(selectedRow => {
                const newRow = this.dataSource.source.find(item => item.id === selectedRow.id);
                if (newRow) {
                    previouslySelectedRows.push(newRow);
                }
            });

            this.dataSource.selection.clear();
            this.dataSource.selection.select(...previouslySelectedRows);
        }
    }
}
