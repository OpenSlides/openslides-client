import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';

import { ScrollingTableManageService } from '../../scrolling-table';
import { ViewListComponent } from '../components/view-list/view-list.component';
import { ColumnRestriction, FilterListService, SearchService, SortListService } from '../definitions';
import { ListSearchService } from '../services/list-search.service';

@Directive()
export class BaseListComponent<V extends Identifiable> implements OnInit, OnDestroy {
    @ViewChild(ViewListComponent, { static: true })
    private readonly _viewListComponent: ViewListComponent<V> | undefined;

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

    @Output()
    public searchFilterUpdated = new EventEmitter<string>();

    public get source(): V[] {
        return this._viewListComponent.source;
    }

    /**
     * Check if mobile and required semaphore for change detection
     */
    public isMobile = false;

    /**
     * Search input value
     */
    @Input()
    public inputValue = ``;

    public get currentOffset(): number {
        if (!this._viewListComponent.scrollViewport) {
            return 0;
        }

        return this._viewListComponent.scrollViewport.measureScrollOffset(`top`);
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
                .filter(restriction => this.toRestrictFn(restriction))
                .map(restriction => restriction.columnName);
            hidden = hidden.concat(restrictedColumns);
        }

        // define columns that are hidden in mobile
        if (this.isMobile && this.hiddenInMobile && this.hiddenInMobile.length) {
            hidden = hidden.concat(this.hiddenInMobile);
        }

        hidden = hidden.concat(this.toHideFn());

        return hidden;
    }

    protected vp = inject(ViewPortService);
    protected cd = inject(ChangeDetectorRef);
    protected scrollingTableManager = inject(ScrollingTableManageService);

    public constructor() {
        this.vp.isMobileSubject.subscribe(mobile => {
            if (mobile !== this.isMobile) {
                this.cd.markForCheck();
            }
            this.isMobile = mobile;
        });
    }

    public async ngOnInit(): Promise<void> {
        this.searchService = this.searchService || new ListSearchService(this.filterProps, this.alsoFilterByProperties);
        this.cd.detectChanges();
    }

    /**
     * Stop the change detection
     */
    public ngOnDestroy(): void {
        this.cd.detach();
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

    public scrollTo(offset: number): void {
        this._viewListComponent.scrollTo(offset);
    }

    public selectAll(): void {
        this.scrollingTableManager.currentScrollingTableComponent?.selectAll();
    }

    public deselectAll(): void {
        this.scrollingTableManager.currentScrollingTableComponent?.deselectAll();
    }
}
