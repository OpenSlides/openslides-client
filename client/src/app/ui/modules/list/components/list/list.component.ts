import {
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
import { map, Observable, of, Subject, Subscription } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';

import { ViewPortService } from '../../../../../site/services/view-port.service';
import { ScrollingTableComponent } from '../../../scrolling-table/components/scrolling-table/scrolling-table.component';
import { FilterListService } from '../../definitions/filter-service';
import { SearchService } from '../../definitions/search-service';
import { SortListService } from '../../definitions/sort-service';
import { ListSearchService } from '../../services/list-search.service';

/**
 * To hide columns via restriction
 */
export interface ColumnRestriction<P = any> {
    columnName: string;
    permission: P;
}

@Component({
    selector: `os-list`,
    templateUrl: `./list.component.html`,
    styleUrls: [`./list.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ListComponent<V extends Identifiable> implements OnInit, OnDestroy {
    @ViewChild(ScrollingTableComponent, { static: true })
    public readonly scrollingTableComponent: ScrollingTableComponent<V> | undefined;

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

    @Input()
    public searchService: SearchService<V> | undefined;

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
     * The actual height of the ListComponent. You can pass only a string to adjust the height,
     * because it is passed to the [ngStyle] of the underlying template.
     * The viewport height is decreased by `90px`. This is almost the summary of the height of the global
     * and local headbar.
     */
    @Input()
    public componentHeight = `calc(100vh - 90px)`;

    /**
     * Determines whether the table should have a fixed 100vh height or not.
     * If not, the height must be set by the component
     */
    @Input()
    public fullScreen = true;

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
     * When filtering the list via search bar,
     * the first property that exists both in this array and the filtered object will be compared to the search value.
     * If the search value is included in the properties value, the object will be shown.
     */
    @Input()
    public alsoFilterByProperties: string[] = [`id`];

    /**
     * Double binding the selected rows
     */
    @Output()
    public selectedRowsChange = new EventEmitter<V[]>();

    public get source(): V[] {
        return this.scrollingTableComponent.source;
    }

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

    public get currentOffset(): number {
        return 0;
        // return this.ngrid.viewport.measureScrollOffset();
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

    public get currentCountObservable(): Observable<number> {
        return this.dataListObservable.pipe(map(items => items.length));
    }

    public get totalCountObservable(): Observable<number> {
        return this._source.pipe(map(items => items.length));
    }

    /**
     * Observable to the raw data
     */
    public dataListObservable: Observable<V[]> = of([]);

    protected isHoldingShiftKey = false;

    protected previousSelectedRow: V | null = null;

    /**
     * Collect subsciptions
     */
    protected subs: Subscription[] = [];

    private _searchFilterValueSubject = new Subject<string>();
    private _source: Observable<V[]> = of([]);

    private _toRestrictFn: (restriction: ColumnRestriction) => boolean;
    private _toHideFn: () => string[];

    public constructor(protected vp: ViewPortService, protected cd: ChangeDetectorRef) {
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
        this.searchService = this.searchService || new ListSearchService(this.filterProps, this.alsoFilterByProperties);
        this.initDataListObservable();
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
     * Central search/filter function. Can be extended and overwritten by a filterPredicate.
     * Functions for that are usually called 'setFulltextFilter'
     *
     * @param filterValue the string to search for
     */
    public searchFilter(filterValue: string): void {
        this.inputValue = filterValue;
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
        // this.ngrid.viewport.scrollToOffset(offset);
    }

    /**
     * Determines and sets the raw data as observable lists according
     * to the used search and filter services
     */
    private initDataListObservable(): void {
        if (this.listObservableProvider || this.listObservable) {
            this._source = this.listObservableProvider
                ? this.listObservableProvider.getViewModelListObservable()
                : this.listObservable;

            let dataListObservable: Observable<V[]> = this._source!;
            if (this.filterService) {
                this.filterService.initFilters(dataListObservable);
                dataListObservable = this.filterService.outputObservable;
            }
            if (this.sortService) {
                this.sortService.initSorting(dataListObservable);
                dataListObservable = this.sortService.outputObservable;
            }
            if (this.searchService) {
                this.searchService.initSearchService(dataListObservable);
                dataListObservable = this.searchService.outputObservable;
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
