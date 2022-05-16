import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ViewChild,
    ContentChild,
    TemplateRef,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ViewEncapsulation
} from '@angular/core';
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
import { distinctUntilChanged, Observable, Subscription, Subject } from 'rxjs';
import { ViewPortService } from '../../../../../site/services/view-port.service';
import { SortListService } from '../../../../base/sort-service';
import { FilterListService } from '../../../../base/filter-service';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';

/**
 * To hide columns via restriction
 */
export interface ColumnRestriction<P = any> {
    columnName: string;
    permission: P;
}

@Component({
    selector: 'os-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListComponent<V extends Identifiable> implements OnInit, OnDestroy {
    /**
     * Declare the table
     */
    @ViewChild(PblNgridComponent)
    protected ngrid!: PblNgridComponent;

    @ContentChild(`startColumnView`, { read: TemplateRef, static: false })
    public startColumnView: TemplateRef<any> | null = null;

    @ContentChild(`endColumnView`, { read: TemplateRef, static: false })
    public endColumnView: TemplateRef<any> | null = null;

    /**
     * The required repository (prioritized over listObservable)
     */
    @Input()
    public listObservableProvider: ViewModelListProvider<V> | undefined;

    /**
     * ...or the required observable
     */
    @Input()
    public listObservable: Observable<V[]> | undefined;

    /**
     * The currently active sorting service for the list view
     */
    @Input()
    public sortService: SortListService<V> | undefined;

    /**
     * The currently active filter service for the list view. It is supposed to
     * be a FilterListService extending FilterListService.
     */
    @Input()
    public filterService: FilterListService<V> | undefined;

    /**
     * Current state of the multi select mode.
     */
    @Input()
    public multiSelect = false;

    /**
     * columns to hide in mobile mode
     */
    @Input()
    public hiddenInMobile: string[] = [];

    /**
     * To hide columns for users with insufficient permissions
     */
    @Input()
    public restricted: ColumnRestriction[] = [];

    /**
     * An array of currently selected items, upon which multi select actions can be performed
     * see {@link selectItem}.
     */
    @Input()
    public selectedRows: V[] = [];

    /**
     * The specific column definition to display in the table
     */
    @Input()
    public columns: PblColumnDefinition[] = [];

    /**
     * Properties to filter for in the search field of the sort-filter-bar
     */
    @Input()
    public filterProps: string[] = [];

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
    public toRestrictFn: (restriction: ColumnRestriction) => boolean = () => false;

    /**
     * A function to determine whether some columns should be hidden in addition to the "normal" behavior.
     */
    @Input()
    public toHideFn: () => string[] = () => [];

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
    public dataSource: PblDataSource<V> | undefined;

    /**
     * The column set to display in the table
     */
    public columnSet: PblNgridColumnSet | undefined;

    /**
     * To dynamically recreate the columns
     */
    public columnFactory: PblColumnFactory | undefined;

    /**
     * Check if mobile and required semaphore for change detection
     */
    public isMobile: boolean = false;

    /**
     * Search input value
     */
    public inputValue: string = ``;

    public get searchFilterUpdated(): Observable<string> {
        return this._searchFilterValueSubject.asObservable();
    }

    /**
     * Gets the amount of filtered data
     */
    public get countFilter(): number {
        return this.dataSource?.filteredData?.length || 0;
    }

    /**
     * @returns The total length of the data-source.
     */
    public get totalCount(): number {
        return this.dataSource?.length || 0;
    }

    public get currentOffset(): number {
        return this.ngrid.viewport.measureScrollOffset();
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
    protected dataListObservable: Observable<V[]> | undefined;

    protected isHoldingShiftKey = false;

    protected previousSelectedRow: V | null = null;

    /**
     * Collect subsciptions
     */
    protected subs: Subscription[] = [];

    private _searchFilterValueSubject = new Subject<string>();

    private _toRestrictFn: (restriction: ColumnRestriction) => boolean;
    private _toHideFn: () => string[];

    public constructor(
        protected vp: ViewPortService,
        protected cd: ChangeDetectorRef // protected store: StorageService
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
    }

    public async ngOnInit(): Promise<void> {
        this.initDataListObservable();
        this.initDataSource();
        this.changeRowHeight();
        this.cd.detectChanges();
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
    public onSelectRow(event: any): void {
        if (this.multiSelect && this.dataSource) {
            const clickedModel: V = event.row;
            const alreadySelected = this.dataSource.selection.isSelected(clickedModel);
            if (this.isHoldingShiftKey) {
                this.selectMultipleRows(clickedModel, this.previousSelectedRow!);
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
     * @param filterValue the string to search for
     */
    public searchFilter(filterValue: string): void {
        this.inputValue = filterValue;
        this.dataSource?.syncFilter();
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

    public scrollTo(offset: number): void {
        this.ngrid.viewport.scrollToOffset(offset);
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
        if (this.multiSelect && this.dataSource) {
            const previouslySelectedRows: V[] = [];
            this.selectedRows.forEach(selectedRow => {
                const newRow = this.dataSource?.source.find(item => item.id === selectedRow.id);
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
    private initDataSource(): void {
        this.dataSource = this.createDataSource();

        // inform listening components about changes in the data source
        this.dataSource.onSourceChanged.subscribe(() => {
            this.dataSourceChange.next(this.dataSource!);
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
                    this.dataSource!.refresh();
                })
            );
        }

        // refresh the data source if the sorting changed
        if (this.sortService) {
            this.subs.push(
                this.sortService.outputObservable.subscribe(() => {
                    this.dataSource!.refresh();
                })
            );
        }
    }

    private createDataSource(): PblDataSource<V> {
        return createDS<V>()
            .onTrigger(() => this.dataListObservable || [])
            .create();
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

            let dataListObservable: Observable<V[]> = listObservable!;
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
        const sourceArray = this.dataSource?.source ?? [];
        const index = sourceArray.findIndex(row => row.id === firstRow.id);
        const previousIndex = sourceArray.findIndex(row => row.id === secondRow.id);
        if (index === previousIndex) {
            return;
        }
        if (index > previousIndex) {
            this.dataSource?.selection.select(...sourceArray.slice(previousIndex, index));
        } else {
            this.dataSource?.selection.select(...sourceArray.slice(index, previousIndex));
        }
    }

    /**
     * @returns the filter predicate object
     */
    private getFilterPredicate(): DataSourcePredicate {
        const toFiltering = (originItem: V, splittedProp: string[], trimmedInput: string) => {
            const splittedPropsCopy = [...splittedProp];
            let property: unknown;
            let model: unknown = originItem;
            if (!originItem) {
                return null;
            }
            do {
                const subProp = splittedPropsCopy.shift();
                property = (model as any)[subProp!];
                model = property;
            } while (!!property && !!splittedPropsCopy.length);
            if (!property) {
                return null;
            }

            let propertyAsString = ``;
            // If the property is a function, call it.
            if (typeof property === `function`) {
                propertyAsString = `` + property.bind(originItem)();
            } else if (Array.isArray(property) || (property as any).constructor === Array) {
                propertyAsString = (property as any).join(``);
            } else {
                propertyAsString = `` + property;
            }

            if (propertyAsString) {
                const foundProp = propertyAsString.trim().toLowerCase().indexOf(trimmedInput) !== -1;

                if (foundProp) {
                    return true;
                }
            }
            return ``;
        };

        return (item: V): boolean => {
            if (!this.inputValue) {
                return true;
            }

            // filter by sequential number
            const trimmedInput = this.inputValue.trim().toLowerCase();
            const seqNumberString = `` + item[`sequential_number`];
            const foundSeqNumber = seqNumberString.trim().toLowerCase().indexOf(trimmedInput) !== -1;
            if (foundSeqNumber) {
                return true;
            }

            // custom filter predicates
            if (!(this.filterProps && this.filterProps.length)) {
                console.warn(`No filter props are given`);
                return false;
            }
            for (const prop of this.filterProps) {
                // find nested props
                const splittedProp = prop.split(`.`);
                // let currValue: any = item;
                const result = toFiltering(item, splittedProp, trimmedInput);
                if (result) {
                    return true;
                }
            }
            return false;
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
