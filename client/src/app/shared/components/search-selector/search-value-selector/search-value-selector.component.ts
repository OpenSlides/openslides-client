import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    Optional,
    Self,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { auditTime } from 'rxjs/operators';

import { BaseSearchValueSelectorComponent } from '../base-search-value-selector/base-search-value-selector.component';
import { Selectable } from '../../selectable';

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
    templateUrl: '../base-search-value-selector/base-search-value-selector.component.html',
    styleUrls: [
        '../base-search-value-selector/base-search-value-selector.component.scss',
        './search-value-selector.component.scss'
    ],
    providers: [{ provide: MatFormFieldControl, useExisting: SearchValueSelectorComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchValueSelectorComponent extends BaseSearchValueSelectorComponent {
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

    public controlType = 'search-value-selector';

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
}
