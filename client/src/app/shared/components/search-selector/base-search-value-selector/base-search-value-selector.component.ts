import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

import { BaseFormControlComponent } from 'app/shared/components/base-form-control';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
import { Selectable } from '../../selectable';

@Component({
    template: ''
})
export abstract class BaseSearchValueSelectorComponent extends BaseFormControlComponent<Selectable> {
    @ViewChild('matSelect')
    public matSelect: MatSelect;

    @ViewChild('chipPlaceholder', { static: false })
    public chipPlaceholder: ElementRef<HTMLElement>;

    /**
     * Decide if this should be a single or multi-select-field
     */
    @Input()
    public multiple = false;

    /**
     * Decide, if none should be included, if multiple is false.
     */
    @Input()
    public includeNone = true;

    @Input()
    public showChips = true;

    @Input()
    public noneTitle = '–';

    @Input()
    public errorStateMatcher: ParentErrorStateMatcher;

    /**
     * Whether to show a button, if there is no matching option.
     */
    @Input()
    public showNotFoundButton = false;

    /**
     * Emits the currently searched string.
     */
    @Output()
    public clickNotFound = new EventEmitter<string>();

    public searchValueForm: FormControl;

    public get empty(): boolean {
        return Array.isArray(this.contentForm.value) ? !this.contentForm.value.length : !this.contentForm.value;
    }

    public get selectedItems(): Selectable[] {
        if (this.multiple && this.selectableItems?.length && this.contentForm.value) {
            return this.selectableItems.filter(item => {
                return this.contentForm.value.includes(item.id);
            });
        }
        return [];
    }

    public get width(): string {
        return this.chipPlaceholder ? `${this.chipPlaceholder.nativeElement.clientWidth - 16}px` : '100%';
    }

    public selectedIds: any[] = [];

    /**
     * All items
     */
    protected selectableItems: Selectable[];

    protected noneItem: Selectable = {
        getListTitle: () => this.noneTitle,
        getTitle: () => this.noneTitle,
        id: null
    };

    /**
     * Function to get a list filtered by the entered search value.
     *
     * @returns The filtered list of items.
     */
    public getFilteredItemsBySearchValue(): Selectable[] {
        if (!this.selectableItems) {
            return [];
        }
        const searchValue: string = this.searchValueForm.value.trim().toLowerCase();
        const filteredItems = this.selectableItems.filter(item => {
            const idString = '' + item.id;
            const foundId = idString.trim().toLowerCase().indexOf(searchValue) !== -1;

            if (foundId) {
                return true;
            }

            return item.toString().toLowerCase().indexOf(searchValue) > -1;
        });
        if (!this.multiple && this.includeNone) {
            return [this.noneItem].concat(filteredItems);
        } else {
            return filteredItems;
        }
    }

    public removeItem(itemId: number): void {
        const items = <number[]>this.contentForm.value;
        items.splice(
            items.findIndex(item => item === itemId),
            1
        );
        this.contentForm.setValue(items);
    }

    public onContainerClick(event: MouseEvent): void {
        if (!this.matSelect) {
            console.warn('Warning: No #matSelect was defined.');
            return;
        }
        this.matSelect.open();
    }

    /**
     * Emits the click on 'notFound' and resets the search-value.
     */
    public onNotFoundClick(): void {
        this.clickNotFound.emit(this.searchValueForm.value);
        this.searchValueForm.setValue('');
    }

    protected initializeForm(): void {
        this.contentForm = this.fb.control([]);
        this.searchValueForm = this.fb.control('');
    }

    protected updateForm(value: Selectable[] | Selectable | null): void {
        if (typeof value === 'function') {
            throw new Error(`Warning: Trying to set a function as value: ${value}`);
        }
        this.contentForm.setValue(value);
        this.selectedIds = value ? (value as []) : [];
    }
}
