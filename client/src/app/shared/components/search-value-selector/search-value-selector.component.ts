import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Optional,
    Output,
    Self,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { auditTime } from 'rxjs/operators';

import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
import { BaseSearchValueSelectorComponent } from '../base-search-value-selector';
import { Selectable } from '../selectable';

/**
 * Searchable Value Selector
 *
 * Use `multiple="true"`, `[inputListValues]=myValues`,`formControlName="myformcontrol"` and
 * `placeholder={{listname}}` to pass the Values and Listname
 *
 * ## Examples:
 *
 * ### Usage of the selector:
 *
 * ```html
 * <os-search-value-selector
 *   [multiple]="true"
 *   placeholder="Placeholder"
 *   [inputListValues]="myListValues"
 *   formControlName="myformcontrol">
 * </os-search-value-selector>
 * ```
 *
 */

@Component({
    selector: 'os-search-value-selector',
    templateUrl: './search-value-selector.component.html',
    styleUrls: ['./search-value-selector.component.scss'],
    providers: [{ provide: MatFormFieldControl, useExisting: SearchValueSelectorComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchValueSelectorComponent extends BaseSearchValueSelectorComponent<Selectable> {
    @ViewChild(CdkVirtualScrollViewport, { static: true })
    public cdkVirtualScrollViewPort: CdkVirtualScrollViewport;

    /**
     * The inputlist subject. Subscribes to it and updates the selector, if the subject
     * changes its values.
     */
    @Input()
    public set inputListValues(value: Selectable[] | Observable<Selectable[]>) {
        if (!value) {
            return;
        }
        if (Array.isArray(value)) {
            console.log('search-value-selector', value);
            this.selectableItems = value;
        } else {
            this.subscriptions.push(
                value.pipe(auditTime(10)).subscribe(items => {
                    this.selectableItems = items;
                    if (this.contentForm) {
                        this.disabled = !items || (!!items && !items.length);
                    }
                })
            );
        }
    }

    public get selectedItems(): Selectable[] {
        if (this.multiple && this.selectableItems?.length && this.contentForm.value) {
            return this.selectableItems.filter(item => {
                return this.contentForm.value.includes(item.id);
            });
        }
        return [];
    }

    public controlType = 'search-value-selector';

    private noneItem: Selectable = {
        getListTitle: () => this.noneTitle,
        getTitle: () => this.noneTitle,
        id: null
    };

    public selectedIds: number[] = [];

    public constructor(
        protected translate: TranslateService,
        formBuilder: FormBuilder,
        @Optional() @Self() public ngControl: NgControl,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }

    public openSelect(event: boolean): void {
        if (event) {
            this.cdkVirtualScrollViewPort.scrollToIndex(0);
            this.cdkVirtualScrollViewPort.checkViewportSize();
        }
    }

    /**
     * Function to get a list filtered by the entered search value.
     *
     * @returns The filtered list of items.
     */
    public getFilteredItems(): Selectable[] {
        if (!this.selectableItems) {
            return [];
        }
        const searchValue: string = this.searchValue.value.toLowerCase();
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

    public removeChipItem(item: Selectable): void {
        this.addRemoveId(item.id);
    }

    private addRemoveId(item: number): void {
        const idx = this.selectedIds.indexOf(item);
        if (idx > -1) {
            this.selectedIds.splice(idx, 1);
        } else {
            this.selectedIds.push(item);
        }
        this.contentForm.setValue(this.selectedIds);
    }

    public onSelectionChange(change: MatOptionSelectionChange): void {
        if (this.multiple && change.isUserInput) {
            const value = change.source.value;
            this.addRemoveId(value);
        }
    }

    protected updateForm(value: Selectable[] | Selectable | null): void {
        if (typeof value === 'function') {
            console.warn('Trying to set a function as value:', value);
        } else {
            this.contentForm.setValue(value);
        }
    }
}
