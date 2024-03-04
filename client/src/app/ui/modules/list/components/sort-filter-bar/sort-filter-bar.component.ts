import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { OsFilterIndicator } from 'src/app/site/base/base-filter.service';
import { OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { FilterListService } from 'src/app/ui/modules/list/definitions/filter-service';
import { OsSortOption, SortListService } from 'src/app/ui/modules/list/definitions/sort-service';

import { RoundedInputComponent } from '../../../input/components/rounded-input/rounded-input.component';
import { SearchService } from '../../definitions/search-service';
import { SortBottomSheetComponent } from '../sort-bottom-sheet/sort-bottom-sheet.component';

/**
 * Reusable bar for list views, offering sorting and filter options.
 * It will modify the DataSource of the listView to include custom sorting and
 * filters.
 *
 * ## Examples:
 * ### Usage of the selector:
 *
 * ```html
 * <os-sort-filter-bar [sortService]="sortService" [filterService]="filterService"
 * (searchFieldChange)="searchFilter($event)" [filterCount]="filteredCount">
 * </os-sort-filter-bar>
 * ```
 */
@Component({
    selector: `os-sort-filter-bar`,
    templateUrl: `./sort-filter-bar.component.html`,
    styleUrls: [`./sort-filter-bar.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortFilterBarComponent<V extends Identifiable> implements OnInit {
    @ViewChild(`searchField`, { static: true })
    private readonly _searchFieldComponent!: RoundedInputComponent | undefined;

    /**
     * The currently active sorting service for the list view
     */
    @Input()
    public sortService: SortListService<V> | undefined;

    /**
     * The currently active filter service for the list view. It is supposed to
     * be a FilterListService extendingFilterListService.
     */
    @Input()
    public filterService: FilterListService<V> | undefined;

    @Input()
    public searchService: SearchService<V> | undefined;

    /**
     * Optional string to tell the verbose name of the filtered items. This string is displayed,
     * if no filter service is given.
     */
    @Input()
    public itemsVerboseName!: string;

    /**
     * Custom input for the search-field.
     * Used to change the value of the input from outside of this component.
     *
     * @todo: We should rename this to `searchValue` and `searchValueChange` to achieve two way data-binding
     */
    @Input()
    public set searchFieldInput(input: string) {
        this.searchService?.search(input);
        this.searchFieldChanged.emit(input);
        this._searchField = input;
    }

    public get searchFieldInput(): string {
        return this._searchField;
    }

    /**
     * EventEmitter to emit the next search-value.
     */
    @Output()
    public searchFieldChanged = new EventEmitter<string>();

    /**
     * The filter side drawer
     */
    @ViewChild(MatDrawer, { static: true })
    public filterMenu: MatDrawer;

    /**
     * The bottom sheet used to alter sorting in mobile view
     */
    @ViewChild(`sortBottomSheet`)
    public sortBottomSheet!: SortBottomSheetComponent<V>;

    /** Optional number to overwrite the display of the filtered data count, if any additional filters
     * (e.g. the angular search bar) are applied on top of these filters
     */
    @Input()
    public filterCount = 0;

    /**
     * Overwrites the total-count. If there is no filter-service set, this is used by default.
     */
    @Input()
    public totalCount = 0;

    @Input()
    public showSpacer = false;

    public get sortOptions(): OsSortOption<V>[] {
        return this.sortService.sortOptions;
    }

    public get sortOptionsWithoutDefault(): OsSortOption<V>[] {
        const defaultOption = this.defaultOption;
        if (!defaultOption) {
            return this.sortOptions;
        }
        return this.sortOptions.filter(
            option => !defaultOption || this.getSortLabel(option) !== this.getSortLabel(defaultOption)
        );
    }

    public get defaultOption(): OsSortOption<V> {
        return this.sortService.defaultOption;
    }

    public get filterAmount(): number {
        if (this.filterService) {
            const filterCount = this.filterService.filterCount;
            return !!filterCount ? filterCount : 0;
        }
        return 0;
    }

    public get hasSortOptionSelected(): boolean {
        return this.sortService.hasSortOptionSelected;
    }

    public get sortOption(): OsSortingOption<V> {
        if (!this._sortOption) {
            this._sortOption = this.sortOptions.find(option => option.property === this.sortService.sortProperty);
        }
        return this._sortOption;
    }

    public set sortOption(option: OsSortingOption<V>) {
        // If the option has a custom sorting function
        this.sortService.sortFn = option.sortFn;
        this.sortService.sortProperty = option.property;
        this._sortOption = option;
    }

    public searchEdit = false;

    private _sortOption: OsSortingOption<V>;

    private _searchField = ``;

    public constructor(
        protected translate: TranslateService,
        public vp: ViewPortService,
        private bottomSheet: MatBottomSheet
    ) {}

    public ngOnInit() {
        this.vp.isMobileSubject.subscribe(v => {
            if (v) {
                this.searchEdit = false;
            }
        });
    }

    /**
     * on Click, remove Filter
     * @param filter
     */
    public removeFilterFromStack(filter: OsFilterIndicator<V>): void {
        this.filterService!.toggleFilterOption(filter.property, filter.option);
    }

    /**
     * Clear all filters
     */
    public onClearAllButton(event: MouseEvent): void {
        event.stopPropagation();
        this.filterService!.clearAllFilters();
    }

    /**
     * Handles the sorting menu/bottom sheet (depending on state of mobile/desktop)
     */
    public openSortDropDown(): void {
        if (this.vp.isMobile) {
            const bottomSheetRef = this.bottomSheet.open(SortBottomSheetComponent, { data: this.sortService });
            bottomSheetRef.afterDismissed().subscribe(result => {
                if (result) {
                    this.sortService.sortProperty = result;
                }
            });
        }
    }

    /**
     * Checks if there is an active SortService present
     */
    public get hasSorting(): boolean {
        return this.sortService && this.sortService.isActive;
    }

    /**
     * Checks if there is an active FilterService present
     * @returns wether the filters are present or not
     */
    public get hasFilters(): boolean {
        return this.filterService && this.filterService.hasFilterOptions;
    }

    /**
     * Retrieves the currently active icon for an option.
     * @param option
     */
    public getSortIcon(option: OsSortingOption<V>): string | null {
        const icon = this.sortService.getSortIcon(option);
        return icon ? icon : null;
    }

    /**
     * Gets the label for anoption. If no label is defined, a capitalized version of
     * the property is used.
     * @param option
     */
    public getSortLabel(option?: OsSortingOption<V>): string {
        if (!option) {
            return ``;
        }
        if (option.label) {
            return option.label;
        }
        const itemProperty = option.property as string;
        return itemProperty.charAt(0).toUpperCase() + itemProperty.slice(1);
    }

    public get showSearchIconOnly(): boolean {
        return this.vp.isMobile && !this.searchEdit && !this.searchFieldInput;
    }

    public toggleSearchEdit(): void {
        this.searchEdit = !this.searchEdit;
    }

    @HostListener(`document:keydown`, [`$event`]) public onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === `f`) {
            event.preventDefault();
            event.stopPropagation();
            this._searchFieldComponent.focus();
        }
    }
}
