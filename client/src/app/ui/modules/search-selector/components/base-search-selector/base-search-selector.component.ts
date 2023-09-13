import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces/selectable';

import { BaseFormFieldControlComponent } from '../../../../base/base-form-field-control';
import { OsOptionSelectionChanged } from '../../definitions';
import { SearchSelectorNotFoundTemplateDirective } from '../../directives/search-selector-not-found-template.directive';
import { ParentErrorStateMatcher } from '../../validators';

@Directive()
export abstract class BaseSearchSelectorComponent extends BaseFormFieldControlComponent<Selectable> implements OnInit {
    @ViewChild(CdkVirtualScrollViewport, { static: true })
    public cdkVirtualScrollViewPort!: CdkVirtualScrollViewport;

    @ViewChild(`matSelect`)
    public matSelect!: MatSelect;

    @ViewChild(`searchSelectorInput`)
    public inputDiv!: ElementRef;

    @ViewChild(`chipPlaceholder`, { static: false })
    public chipPlaceholder!: ElementRef<HTMLElement>;

    @ContentChild(SearchSelectorNotFoundTemplateDirective, { read: TemplateRef, static: false })
    public notFoundTemplate: TemplateRef<HTMLElement> | null = null;

    /**
     * Decide if this should be a single or multi-select-field
     */
    @Input()
    public multiple = false;

    /**
     * Decide, if none should be included, if multiple is false.
     */
    @Input()
    public includeNone = false;

    @Input()
    public showChips = true;

    @Input()
    public noneTitle = `–`;

    @Input()
    public errorStateMatcher!: ParentErrorStateMatcher;

    /**
     * Label showing, if there are no options for a specific search.
     */
    @Input()
    public noOptionsFoundLabel = _(`No options found`);

    /**
     * A function can be passed to transform a value before it is set as value of the underlying form-control.
     */
    @Input()
    public transformSetFn?: (value: any) => any; // It is actually an Ids type

    /**
     * A function can be passed to transform a value propagated from a change-event of the underlying form-control,
     * before it is propagated to the parent form-group/ng-model.
     * Useful to change the output of a form-control.
     */
    @Input()
    public transformPropagateFn: (value: any) => any = value => value; // It is actually an Ids type

    /**
     * Function to determine depending on a specific selectable item whether the item should be disabled.
     *
     * @returns `true` if the item should be disabled.
     */
    @Input()
    public disableOptionWhenFn: (value: Selectable) => boolean = () => false;

    /**
     * Function to determine whether a tooltip should be displayed on the given option
     *
     * @returns either the string that will be displayed as tooltip or `null` if no tooltip should be displayed
     */
    @Input()
    public tooltipFn: (value: Selectable, source: MatOption) => string = () => ``;

    /**
     * Function that calculates something that is to be appended after an item.
     *
     * @returns a string containing whatever should follow the items title in the selector.
     */
    @Input()
    public getItemAdditionalInfoFn: (item: Selectable) => string = () => ``;

    /**
     * Allows for the definition of additional strings that should be checked against the search value for a given item
     */
    @Input()
    public getAdditionallySearchedValuesFn: (item: Selectable) => string[] = () => [];

    @Input()
    public set sortFn(fn: false | ((valueA: Selectable, valueB: Selectable) => number)) {
        if (typeof fn === `function` || fn === false) {
            this._sortFn = fn;
        } else {
            this._sortFn = this._defaultSortFn;
        }
    }

    public get sortFn(): false | ((valueA: Selectable, valueB: Selectable) => number) {
        return this._sortFn;
    }

    @Input()
    public showEntriesNumber = 4;

    @Input()
    public excludeIds = false;

    /**
     * If true, the dialog will not close when a value is selected.
     */
    @Input()
    public keepOpen = false;

    /**
     * If true, the dialog will be opened with double width.
     */
    @Input()
    public wider = false;

    public itemSizeInPx = 50;

    public get panelHeight(): number {
        return this.showEntriesNumber * this.itemSizeInPx;
    }

    public get maxHeight(): string {
        return 112 + this.panelHeight + `px`;
    }

    private _defaultSortFn = (a: Selectable, b: Selectable) =>
        a && typeof a.getTitle() === `string` ? a.getTitle().localeCompare(b.getTitle()) : 0;

    private _sortFn: false | ((valueA: Selectable, valueB: Selectable) => number) = this._defaultSortFn;

    /**
     * Emits the currently searched string.
     */
    @Output()
    public clickNotFound = new EventEmitter<string>();

    @Output()
    public selectionChanged = new EventEmitter<OsOptionSelectionChanged>();

    @Output()
    public openedChange = new EventEmitter<boolean>();

    public override contentForm!: UntypedFormControl;
    public searchValueForm!: UntypedFormControl;

    public get showNotFoundButton(): boolean {
        return !!this.notFoundTemplate && !this.filteredItemsSubject.getValue().length && !!this.searchValueForm.value;
    }

    public get empty(): boolean {
        return Array.isArray(this._snapshotValue)
            ? !this._snapshotValue.length
            : this._snapshotValue === null || this._snapshotValue === undefined;
    }

    public get selectedItems(): Selectable[] {
        if (this.multiple && this.selectableItems?.length && this.contentForm.value) {
            return this.selectableItems.filter(item => this.contentForm.value.includes(item.id));
        }
        return [];
    }

    public get width(): string {
        return this.chipPlaceholder ? `${this.chipPlaceholder.nativeElement.clientWidth - 16}px` : `100%`;
    }

    public get filteredItemsObservable(): Observable<Selectable[]> {
        return this.filteredItemsSubject;
    }

    public selectedIds: Id[] = [];

    /**
     * All items
     */
    protected set selectableItems(items: Selectable[]) {
        this._selectableItemsIdMap = {};
        const allItems = !this.multiple && this.includeNone ? [this.noneItem].concat(items) : items;
        for (const item of allItems) {
            this._selectableItemsIdMap[item.id] = item;
        }
        this._selectableItemsList = this.sortFn ? allItems.sort(this.sortFn) : allItems;
        this.filteredItemsSubject.next(this.getFilteredItemsBySearchValue());
    }

    protected get selectableItems(): Selectable[] {
        return this._selectableItemsList;
    }

    protected noneItem: Selectable = {
        getListTitle: () => this.noneTitle,
        getTitle: () => this.noneTitle,
        id: 0
    };

    protected readonly filteredItemsSubject = new BehaviorSubject<Selectable[]>([]);

    /**
     * The synchronized value of the contentForm form control.
     * Used to determine, if this form control is empty before the timeout is fulfilled.
     */
    private _snapshotValue: Selectable[] | Selectable | null = null;
    private _isFirstUpdate = true;

    private _selectableItemsIdMap: { [id: number]: Selectable } = {};
    private _selectableItemsList: Selectable[] = [];

    private get currentSearchValue(): string {
        return this.searchValueForm.value.trim().toLowerCase();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.searchValueForm.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe(value => {
                this.onSearchValueUpdated(value.trim());
            })
        );

        //Create css style for the mat-selects panel
        const sheet = document.createElement(`style`);
        sheet.innerHTML = `.os-search-selector { max-height: ${this.maxHeight} !important;}`;
        document.body.appendChild(sheet);
    }

    public onChipRemove(itemId: Id): void {
        this.addOrRemoveId(itemId);

        this.matSelect.options.find(option => option.value === itemId)?.deselect(); // To ensure that the checkbox is updated in the view
    }

    private addOrRemoveId(id: Id): void {
        if (!Array.isArray(this.selectedIds)) {
            this.selectedIds = [];
        }
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
            this.selectedIds.splice(index, 1);
        } else {
            this.selectedIds.push(id);
        }
        this.setNextValue(this.selectedIds);
    }

    public onOpenChanged(event: boolean): void {
        this.openedChange.emit(event);
        if (event) {
            // Ensure that the main panel doesn't ever scroll away from the top
            const panelElement = this.matSelect.panel.nativeElement as HTMLElement;
            const inputRect = this.inputDiv.nativeElement.getBoundingClientRect();
            const cdkRect = this.cdkVirtualScrollViewPort.elementRef.nativeElement.getBoundingClientRect();
            document.documentElement.style.setProperty(
                `--os-search-selector-panel-height`,
                `${cdkRect.bottom - inputRect.top}px`
            );
            panelElement.addEventListener(`scroll`, () => {
                if (panelElement.scrollTop !== 0) {
                    panelElement.scrollTo({ top: 0 });
                }
            });

            this.cdkVirtualScrollViewPort.scrollToIndex(0);
            this.cdkVirtualScrollViewPort.checkViewportSize();
        } else {
            this.searchValueForm.setValue(``);
        }
    }

    public onSelectionChange(value: Selectable, change: MatOptionSelectionChange): void {
        if (change.isUserInput) {
            if (this.multiple) {
                this.addOrRemoveId(value.id);
                this.selectionChanged.emit({ value, selected: change.source.selected });
            }
        }
    }

    public onContainerClick(): void {
        if (!this.matSelect) {
            console.warn(`Warning: No #matSelect was defined.`);
            return;
        }
        this.matSelect.open();
    }

    public onSearchKeydown(event: any): void {
        // Only propagate enter, up, down
        if ([13, 38, 40].indexOf(event.keyCode) === -1) {
            event.stopPropagation();
        }
    }

    /**
     * Emits the click on 'notFound' and resets the search-value.
     */
    public onNotFoundClick(): void {
        this.clickNotFound.emit(this.searchValueForm.value);
        this.searchValueForm.setValue(``);
    }

    public getItemById(id: number): Selectable {
        return this.selectableItems.find(item => item.id === id);
    }

    protected onSearchValueUpdated(nextValue: string): void {
        this.filteredItemsSubject.next(this.getFilteredItemsBySearchValue(nextValue.toLowerCase()));
    }

    protected initializeForm(): void {
        this.searchValueForm = this.fb.control(``);
    }

    protected addSelectableItem(item: Selectable): void {
        if (!this._selectableItemsIdMap[item.id]) {
            this._selectableItemsIdMap[item.id] = item;
            this._selectableItemsList.push(item);
        }
    }

    protected override createForm(): UntypedFormControl {
        return this.fb.control(this.multiple ? [] : null);
    }

    protected updateForm(value: Selectable[] | Selectable | null): void {
        if (typeof value === `function`) {
            throw new Error(`Warning: Trying to set a function as value: ${value}`);
        }
        let nextValue = this.transformSetFn ? this.transformSetFn(value) : value;
        if (nextValue && this.multiple && !Array.isArray(nextValue)) {
            nextValue = [nextValue];
        }
        this.setNextValue(nextValue);
        this.selectedIds = (nextValue as []) ?? [];
    }

    /**
     * Can be overriden to perform actions after the first update triggered.
     * This method is only called, if this form is not empty.
     */
    protected onAfterFirstUpdate(): void | Promise<void> {}

    protected override push(value: Selectable): void {
        this._snapshotValue = value;
        const nextValue = this.transformPropagateFn(value);
        setTimeout(() => super.push(nextValue));
    }

    private triggerUpdate(): void {
        if (this.empty) {
            return;
        }
        if (this._isFirstUpdate) {
            this._isFirstUpdate = false;
            this.onAfterFirstUpdate();
        }
    }

    private setNextValue(value: any): void {
        this._snapshotValue = value;
        setTimeout(() => {
            this.contentForm.setValue(value);
            this.triggerUpdate();
        });
    }

    /**
     * Function to get a list filtered by the entered search value.
     *
     * @returns The filtered list of items.
     */
    private getFilteredItemsBySearchValue(searchValue: string = this.currentSearchValue): Selectable[] {
        if (!this.selectableItems) {
            return [];
        }
        if (!searchValue.length) {
            return this.selectableItems;
        }
        const filteredItems = this.selectableItems.filter(item => {
            if (!this.excludeIds) {
                const idString = `` + item.id;
                const foundId = idString.trim().toLowerCase().indexOf(searchValue) !== -1;

                if (foundId) {
                    return true;
                }
            }

            return this.getAdditionallySearchedValuesFn(item)
                .concat(item.toString())
                .some(value => value.toLowerCase().indexOf(searchValue) > -1);
        });
        return filteredItems;
    }
}
