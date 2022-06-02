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
import { FormControl } from '@angular/forms';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
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
    public noOptionsFoundLabel = `No options found`;

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

    @Input()
    public sortFn: false | ((valueA: Selectable, valueB: Selectable) => number) = (a, b) =>
        a && typeof a.getTitle() === `string` ? a.getTitle().localeCompare(b.getTitle()) : 0;

    /**
     * Emits the currently searched string.
     */
    @Output()
    public clickNotFound = new EventEmitter<string>();

    @Output()
    public selectionChanged = new EventEmitter<OsOptionSelectionChanged>();

    public override contentForm!: FormControl;
    public searchValueForm!: FormControl;

    public get showNotFoundButton(): boolean {
        return !!this.notFoundTemplate && !this.filteredItemsSubject.getValue().length && !!this.searchValueForm.value;
    }

    public get empty(): boolean {
        return Array.isArray(this._snapshotValue) ? !this._snapshotValue.length : !this._snapshotValue;
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
        return this.filteredItemsSubject.asObservable();
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
    }

    public onChipRemove(itemId: Id): void {
        this.addOrRemoveId(itemId);
    }

    public addOrRemoveId(id: Id): void {
        if (!Array.isArray(this.selectedIds)) {
            this.selectedIds = [];
        }
        const index = this.selectedIds.indexOf(id);
        const value = this._selectableItemsIdMap[id];
        let selected = false;
        if (index > -1) {
            this.selectedIds.splice(index, 1);
        } else {
            this.selectedIds.push(id);
            selected = true;
        }
        this.setNextValue(this.selectedIds);
        this.selectionChanged.emit({ value, selected });
    }

    public onOpenChanged(event: boolean): void {
        if (event) {
            this.cdkVirtualScrollViewPort.scrollToIndex(0);
            this.cdkVirtualScrollViewPort.checkViewportSize();
        }
    }

    public onSelectionChange(value: Selectable, change: MatOptionSelectionChange): void {
        if (change.isUserInput && this.multiple) {
            this.addOrRemoveId(value.id);
        }
    }

    public onContainerClick(): void {
        if (!this.matSelect) {
            console.warn(`Warning: No #matSelect was defined.`);
            return;
        }
        this.matSelect.open();
    }

    /**
     * Emits the click on 'notFound' and resets the search-value.
     */
    public onNotFoundClick(): void {
        this.clickNotFound.emit(this.searchValueForm.value);
        this.searchValueForm.setValue(``);
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
        }
    }

    protected override createForm(): FormControl {
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
            const idString = `` + item.id;
            const foundId = idString.trim().toLowerCase().indexOf(searchValue) !== -1;

            if (foundId) {
                return true;
            }

            return item.toString().toLowerCase().indexOf(searchValue) > -1;
        });
        return filteredItems;
    }
}
