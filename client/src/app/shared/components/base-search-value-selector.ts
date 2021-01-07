import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

import { BaseFormControlComponent } from 'app/shared/components/base-form-control';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';

@Component({
    template: ''
})
export abstract class BaseSearchValueSelectorComponent<T> extends BaseFormControlComponent<T> {
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

    public searchValue: FormControl;

    public get empty(): boolean {
        return Array.isArray(this.contentForm.value) ? !this.contentForm.value.length : !this.contentForm.value;
    }

    public get selectedItems(): T[] {
        return this.selectableItems && this.contentForm.value
            ? this.selectableItems.filter(item => this.contentForm.value.includes(item))
            : [];
    }

    public get width(): string {
        return this.chipPlaceholder ? `${this.chipPlaceholder.nativeElement.clientWidth - 16}px` : '100%';
    }

    /**
     * All items
     */
    protected selectableItems: T[];

    /**
     * Function to get a list filtered by the entered search value.
     *
     * @returns The filtered list of items.
     */
    public getFilteredItems(): T[] {
        if (!this.selectableItems) {
            return [];
        }
        const searchValue: string = this.searchValue.value.toLowerCase();
        return this.selectableItems.filter(item => {
            const idString = '' + item;
            const foundId = idString.trim().toLowerCase().indexOf(searchValue) !== -1;

            if (foundId) {
                return true;
            }

            return item.toString().toLowerCase().indexOf(searchValue) > -1;
        });
    }

    public removeItem(itemId: number): void {
        const items = <number[]>this.contentForm.value;
        items.splice(
            items.findIndex(item => item === itemId),
            1
        );
        this.contentForm.setValue(items);
    }

    public onContainerClick(event: MouseEvent): void {}

    /**
     * Emits the click on 'notFound' and resets the search-value.
     */
    public onNotFoundClick(): void {
        this.clickNotFound.emit(this.searchValue.value);
        this.searchValue.setValue('');
    }

    protected initializeForm(): void {
        this.contentForm = this.fb.control([]);
        this.searchValue = this.fb.control('');
    }

    protected updateForm(value: T[] | T | null): void {
        this.contentForm.setValue(value);
    }
}
