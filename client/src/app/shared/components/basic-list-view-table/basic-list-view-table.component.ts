import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import {
    columnFactory,
    createDS,
    DataSourcePredicate,
    PblColumnDefinition,
    PblColumnFactory,
    PblDataSource,
    PblNgridColumnSet,
    PblNgridComponent
} from '@pebula/ngrid';
import { PblNgridDataMatrixRow } from '@pebula/ngrid/target-events';
import { StorageService } from 'app/core/core-services/storage.service';
import { HasViewModelListObservable } from 'app/core/definitions/has-view-model-list-observable';
import { BaseFilterListService } from 'app/core/ui-services/base-filter-list.service';
import { BaseSortListService } from 'app/core/ui-services/base-sort-list.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { ColumnRestriction } from '../list-view-table/list-view-table.component';

@Component({
    selector: `os-basic-list-view-table`,
    templateUrl: `./basic-list-view-table.component.html`,
    styleUrls: [`./basic-list-view-table.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BasicListViewTableComponent<V extends BaseViewModel> implements OnInit, OnDestroy /* , AfterViewInit */ {
    /**
     * Declare the table
     */
    @ViewChild(PblNgridComponent)
    protected ngrid!: PblNgridComponent;

    @ContentChild(`startColumnView`, { read: TemplateRef, static: false })
    public startColumnView: TemplateRef<any>;

    @ContentChild(`endColumnView`, { read: TemplateRef, static: false })
    public endColumnView: TemplateRef<any>;

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
    public selectedRows: V[];

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

    /**
     * Most, of not all list views require these
     */
    @Input()
    public startColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: `selection`,
            label: ``,
            width: `40px`
        }
    ];

    /**
     * End columns
     */
    @Input()
    public endColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: `menu`,
            label: ``,
            width: `40px`
        }
    ];

    /**
     * A function to determine whether a column will be hidden or not. Every restriction will be hidden, when
     * this function returns `true`.
     */
    @Input()
    public toRestrictFn: (restriction: ColumnRestriction) => boolean;

    /**
     * A function to determine whether some columns should be hidden in addition to the "normal" behavior.
     */
    @Input()
    public toHideFn: () => string[];

    /**
     * Inform about changes in the dataSource
     */
    @Output()
    public dataSourceChange = new EventEmitter<PblDataSource<V>>();

    /**
     * Double binding the selected rows
     */
    @Output()
    public selectedRowsChange = new EventEmitter<V[]>();

    /**
     * Table data source
     */
    public dataSource: PblDataSource<V>;

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
            hidden.push(`selection`);
        }

        if ((!this.alwaysShowMenu && !this.isMobile) || !this.showMenu) {
            hidden.push(`menu`);
        }

        // hide all columns with restrictions
        if (this.restricted && this.restricted.length) {
            const restrictedColumns = this.restricted
                .filter(restriction => this._toRestrictFn(restriction))
                .map(restriction => restriction.columnName);
            hidden = hidden.concat(restrictedColumns);
        }

        // define columns that are hidden in mobile
        if (this.isMobile && this.hiddenInMobile && this.hiddenInMobile.length) {
            hidden = hidden.concat(this.hiddenInMobile);
        }

        hidden = hidden.concat(this._toHideFn());

        return hidden;
    }

    /**
     * Observable to the raw data
     */
    protected dataListObservable: Observable<V[]>;

    protected isHoldingShiftKey = false;

    protected previousSelectedRow: V = null;

    /**
     * Collect subsciptions
     */
    protected subs: Subscription[] = [];

    private _toRestrictFn: (restriction: ColumnRestriction) => boolean;
    private _toHideFn: () => string[];

    public constructor(
        protected vp: ViewportService,
        protected router: Router,
        protected cd: ChangeDetectorRef,
        protected store: StorageService
    ) {
        this._toRestrictFn = restriction =>
            this.toRestrictFn ? this.toRestrictFn(restriction) : this.defaultToRestrictFn(restriction);
        this._toHideFn = () => (this.toHideFn ? this.toHideFn() : this.defaultToHideFn());

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
        this.initDataListObservable();
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
     * Receive manual view updates
     */
    public viewUpdateEvent(): void {
        this.cd.markForCheck();
    }

    /**
     * Generic click handler for rows. Allow so (multi) select anywhere
     * @param event the clicked row
     */
    public onSelectRow(event: PblNgridDataMatrixRow<V>): void {
        if (this.multiSelect) {
            const clickedModel: V = event.row;
            const alreadySelected = this.dataSource.selection.isSelected(clickedModel);
            if (this.isHoldingShiftKey) {
                this.selectMultipleRows(clickedModel, this.previousSelectedRow);
            }
            if (alreadySelected) {
                this.dataSource.selection.deselect(clickedModel);
            } else {
                this.dataSource.selection.select(clickedModel);
                this.previousSelectedRow = clickedModel;
            }
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
        return (await this.store.get<number>(`scroll_${key}`)) || 0;
    }

    /**
     * Store the scroll offset
     */
    private saveScrollOffset(): void {
        if (this.ngrid) {
            const offset = this.ngrid.viewport.measureScrollOffset();
            this.store.set(`scroll_${this.listStorageKey}`, offset);
        }
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

    public onKeyDown(keyEvent: KeyboardEvent): void {
        if (keyEvent.key === `Shift`) {
            this.isHoldingShiftKey = true;
        }
    }

    public onKeyUp(keyEvent: KeyboardEvent): void {
        if (keyEvent.key === `Shift`) {
            this.isHoldingShiftKey = false;
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
            .default({ width: `60px` })
            .table(...this.startColumnDefinitions, ...this.columns, ...this.endColumnDefinitions)
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
    private initDataListObservable(): void {
        if (this.listObservableProvider || this.listObservable) {
            const listObservable = this.listObservableProvider
                ? this.listObservableProvider.getViewModelListObservable()
                : this.listObservable;

            let dataListObservable: Observable<V[]> = listObservable;
            if (this.filterService) {
                this.filterService.initFilters(dataListObservable);
                dataListObservable = this.filterService.outputObservable;
            }
            if (this.sortService) {
                this.sortService.initSorting(dataListObservable);
                dataListObservable = this.sortService.outputObservable;
            }
            this.dataListObservable = dataListObservable;
        }
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
            document.documentElement.style.setProperty(`--pbl-height`, this.vScrollFixed + `px`);
        } else {
            document.documentElement.style.removeProperty(`--pbl-height`);
        }
    }

    /**
     * Selects multiple rows between `firstRow` and `secondRow`.
     * The indices of the two rows are compared to each other to
     * get a subarray beginning at the lower index up to the higher one.
     *
     * @param firstRow The first one of two selected rows.
     * @param secondRow The second one of two selected rows.
     */
    private selectMultipleRows(firstRow: V, secondRow: V): void {
        const sourceArray = this.dataSource.source;
        const index = sourceArray.findIndex(row => row.id === firstRow.id);
        const previousIndex = sourceArray.findIndex(row => row.id === secondRow.id);
        if (index === previousIndex) {
            return;
        }
        if (index > previousIndex) {
            this.dataSource.selection.select(...sourceArray.slice(previousIndex, index));
        } else {
            this.dataSource.selection.select(...sourceArray.slice(index, previousIndex));
        }
    }

    /**
     * @returns the filter predicate object
     */
    private getFilterPredicate(): DataSourcePredicate {
        const toFiltering = (originItem: V, split: string[], trimmedInput: string) => {
            let property: unknown;
            if (!originItem) {
                return;
            }
            for (const subProp of split) {
                property = originItem[subProp];
            }
            if (!property) {
                return;
            }

            let propertyAsString = ``;
            // If the property is a function, call it.
            if (typeof property === `function`) {
                propertyAsString = `` + property.bind(originItem)();
            } else if (Array.isArray(property) || property.constructor === Array) {
                propertyAsString = property.join(``);
            } else {
                propertyAsString = `` + property;
            }

            if (propertyAsString) {
                const foundProp = propertyAsString.trim().toLowerCase().indexOf(trimmedInput) !== -1;

                if (foundProp) {
                    return true;
                }
            }
        };

        return (item: V): boolean => {
            if (!this.inputValue) {
                return true;
            }

            // filter by ID
            const trimmedInput = this.inputValue.trim().toLowerCase();
            const idString = `` + item.id;
            const foundId = idString.trim().toLowerCase().indexOf(trimmedInput) !== -1;
            if (foundId) {
                return true;
            }

            // custom filter predicates
            if (!(this.filterProps && this.filterProps.length)) {
                console.warn(`No filter props are given`);
                return false;
            }
            for (const prop of this.filterProps) {
                // find nested props
                const split = prop.split(`.`);
                // let currValue: any = item;
                const result = toFiltering(item, split, trimmedInput);
                if (result) {
                    return true;
                }
            }
        };
    }

    /**
     * A function to determine restricted columns by default.
     * Columns are restricted, if this function returns `true`.
     * Can be overriden.
     *
     * @param _restriction a `ColumnRestriction` to check.
     * @returns by default `false`.
     */
    protected defaultToRestrictFn = (_restriction: ColumnRestriction) => false;
    /**
     * A function to determine which columns should be hidden by default in addition to
     * the "normal" behavior.
     * Can be overriden.
     *
     * @returns a string-array.
     */
    protected defaultToHideFn = () => [];
}
