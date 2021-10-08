import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ContentChild,
    TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

import { Id } from 'app/core/definitions/key-types';
import { BaseFormControlComponent } from 'app/shared/components/base-form-control';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
import { Selectable } from '../../selectable';
import { NotFoundDescriptionDirective } from '../../../directives/not-found-description.directive';

export interface OsOptionSelectionChanged<T = Selectable> {
    value: T;
    source: MatOption;
}

@Directive()
export abstract class BaseSearchValueSelectorComponent extends BaseFormControlComponent<Selectable> {
    @ViewChild(CdkVirtualScrollViewport, { static: true })
    public cdkVirtualScrollViewPort: CdkVirtualScrollViewport;

    @ViewChild('matSelect')
    public matSelect: MatSelect;

    @ViewChild('chipPlaceholder', { static: false })
    public chipPlaceholder: ElementRef<HTMLElement>;

    @ContentChild(NotFoundDescriptionDirective, { read: TemplateRef, static: false })
    public notFoundDescription: TemplateRef<HTMLElement>;

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
    public noneTitle = '–';

    @Input()
    public errorStateMatcher: ParentErrorStateMatcher;

    /**
     * Label showing, if there are no options for a specific search.
     */
    @Input()
    public noOptionsFoundLabel = 'No options found';

    /**
     * A function can be passed to transform a value before it is set as value of the underlying form-control.
     */
    @Input()
    public transformSetFn?: (value: any) => Selectable;

    /**
     * A function can be passed to transform a value propagated from a change-event of the underlying form-control,
     * before it is propagated to the parent form-group/ng-model.
     * Useful to change the output of a form-control.
     */
    @Input()
    public transformPropagateFn?: (value: Selectable) => Selectable;

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
    public tooltipFn: (value: Selectable, source: MatOption) => string | null = () => null;

    /**
     * Emits the currently searched string.
     */
    @Output()
    public clickNotFound = new EventEmitter<string>();

    @Output()
    public selectionChanged = new EventEmitter<OsOptionSelectionChanged>();

    public searchValueForm: FormControl;

    public get showNotFoundButton(): boolean {
        return (
            !!this.notFoundDescription && !this.getFilteredItemsBySearchValue().length && !!this.searchValueForm.value
        );
    }

    public get empty(): boolean {
        return Array.isArray(this.contentForm.value) ? !this.contentForm.value.length : !this.contentForm.value;
    }

    public get selectedItems(): Selectable[] {
        if (this.multiple && this.selectableItems?.length && this.contentForm.value) {
            return this.selectableItems.filter(item => this.contentForm.value.includes(item.id));
        }
        return [];
    }

    public get width(): string {
        return this.chipPlaceholder ? `${this.chipPlaceholder.nativeElement.clientWidth - 16}px` : '100%';
    }

    public selectedIds: Id[] = [];

    /**
     * All items
     */
    protected set selectableItems(items: Selectable[]) {
        if (!this.multiple && this.includeNone) {
            this._selectableItems = [this.noneItem].concat(items);
        } else {
            this._selectableItems = items;
        }
    }

    protected get selectableItems(): Selectable[] {
        return this._selectableItems;
    }

    protected noneItem: Selectable = {
        getListTitle: () => this.noneTitle,
        getTitle: () => this.noneTitle,
        id: null
    };

    private _isFirstUpdate = true;

    private _selectableItems: Selectable[] = [];

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
        return filteredItems;
    }

    public onChipRemove(itemId: Id): void {
        this.addOrRemoveId(itemId);
    }

    public addOrRemoveId(id: Id): void {
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
            this.selectedIds.splice(index, 1);
        } else {
            this.selectedIds.push(id);
        }
        this.setNextValue(this.selectedIds);
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
            this.selectionChanged.emit({ value, source: change.source });
        }
    }

    public onContainerClick(): void {
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
        const nextValue = this.transformSetFn ? this.transformSetFn(value) : value;
        this.setNextValue(nextValue);
        this.selectedIds = (nextValue as []) ?? [];
        this.triggerUpdate();
    }

    /**
     * Can be overriden to perform actions after the first update triggered.
     * This method is only called, if this form is not empty.
     */
    protected onAfterFirstUpdate(): void | Promise<void> {}

    protected push(value: Selectable): void {
        const nextValue = this.transformPropagateFn ? this.transformPropagateFn(value) : value;
        super.push(nextValue);
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
        this.contentForm.setValue(value);
    }
}
