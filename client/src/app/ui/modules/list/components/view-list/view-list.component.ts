import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, delay, find, map, Observable, of } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewModelListProvider } from 'src/app/ui/base/view-model-list-provider';

import { ScrollingTableComponent } from '../../../scrolling-table/components/scrolling-table/scrolling-table.component';
import { FilterListService, SearchService, SortListService } from '../../definitions';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';

@Component({
    selector: `os-view-list`,
    templateUrl: `./view-list.component.html`,
    styleUrls: [`./view-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ViewListComponent<V extends Identifiable> implements OnInit, OnDestroy {
    @ViewChild(ScrollingTableComponent, { static: true })
    private readonly _scrollingTableComponent: ScrollingTableComponent<V> | undefined;

    @ViewChild(SortFilterBarComponent)
    private readonly _sortFilterBarComponent: SortFilterBarComponent<V> | undefined;

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
     * Determines whether the table should have a fixed 100vh height or not.
     * If not, the height must be set by the component
     */
    @Input()
    public fullScreen = true;

    @Input()
    public hiddenColumns: string[] = [];

    /**
     * When filtering the list via search bar,
     * the first property that exists both in this array and the filtered object will be compared to the search value.
     * If the search value is included in the properties value, the object will be shown.
     */
    @Input()
    public alsoFilterByProperties: string[] = [`id`];

    @Input()
    public searchFieldInput = ``;

    @Input()
    public addBottomSpacer = false;

    /**
     * Will show fake filter buttons with the string keys as content in bar.
     * Closing them will cause the callback function to be called.
     */
    @Input()
    public fakeFilters: Observable<Record<string, () => void>> = null;

    @Input()
    public set totalCount(value: number | Observable<number>) {
        if (value === undefined) {
            this._totalCountObservable = null;
        } else if (value instanceof Observable) {
            this._totalCountObservable = value;
        } else {
            this._totalCountObservable = new BehaviorSubject(value);
        }
    }

    private _totalCountObservable: Observable<number> = null;

    /**
     * Double binding the selected rows
     */
    @Output() public selectedRowsChange = new EventEmitter<V[]>();

    @Output() public searchFilterUpdated = new EventEmitter<string>();

    public get scrollViewport(): CdkVirtualScrollViewport | undefined {
        return this._scrollingTableComponent.scrollViewport;
    }

    public get currentCountObservable(): Observable<number> {
        return this.dataListObservable.pipe(map(items => items.length));
    }

    public get totalCountObservable(): Observable<number> {
        return this._totalCountObservable ?? this._source.pipe(map(items => items.length));
    }

    public get source(): V[] {
        return this._scrollingTableComponent.source;
    }

    public get entriesInViewport(): V[] {
        const entries = [];
        if (this.scrollViewport) {
            const range = this.scrollViewport.getRenderedRange();
            for (let i = range.start; i < range.end; i++) {
                if (this.source[i]) {
                    entries.push(this.source[i]);
                }
            }
        }
        return entries;
    }

    /**
     * Observable to the raw data
     */
    public dataListObservable: Observable<V[]> = of([]);
    public dataFullListObservable: Observable<V[]> = of([]);

    private _source: Observable<V[]> = of([]);

    public ngOnInit(): void {
        this.initDataListObservable();
    }

    public ngOnDestroy(): void {
        if (this.filterService) {
            this.filterService.exitFilterService();
        }

        if (
            this.sortService &&
            !this.listObservableProvider &&
            this.listObservableProvider.getSortedViewModelListObservable()
        ) {
            this.sortService.exitSortService();
        }

        if (this.searchService) {
            this.searchService.exitSearchService();
        }
    }

    /**
     * Determines and sets the raw data as observable lists according
     * to the used search and filter services
     */
    private initDataListObservable(): void {
        if (this.listObservableProvider || this.listObservable) {
            if (this.sortService) {
                this.sortService.initSorting();
            }
            this._source = this.sortService
                ? this.listObservableProvider?.getSortedViewModelListObservable
                    ? this.listObservableProvider.getSortedViewModelListObservable(
                            this.sortService.repositorySortingKey
                        )
                    : this.sortService.getSortedViewModelListObservable()
                : this.listObservableProvider
                    ? this.listObservableProvider.getViewModelListObservable()
                    : this.listObservable;
            let dataListObservable: Observable<V[]> = this._source!;
            if (this.filterService) {
                this._source = this.filterService.getViewModelListObservable();
                this.filterService.initFilters(dataListObservable);
                dataListObservable = this.filterService.outputObservable;
            }
            if (this.searchService) {
                this.searchService.initSearchService(dataListObservable);
                dataListObservable = this.searchService.outputObservable;
            }
            this.dataListObservable = dataListObservable;
            this.dataFullListObservable = this._source;
        }
    }

    public scrollTo(offset: number): void {
        if (!this._scrollingTableComponent.scrollViewport) {
            this._scrollingTableComponent.hasDataObservable
                .pipe(find(hasData => hasData))
                .pipe(delay(10))
                .subscribe(() => {
                    this.scrollTo(offset);
                });

            return;
        }

        this._scrollingTableComponent.scrollViewport.scrollTo({ top: offset });
    }

    public clearSearchField(): void {
        this._sortFilterBarComponent?.clearSearchField();
    }
}
