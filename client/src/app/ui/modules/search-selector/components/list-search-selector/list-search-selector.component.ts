import { ChangeDetectionStrategy, Component, Input, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { auditTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

import { Selectable } from '../../../../../domain/interfaces/selectable';
import { BaseSearchSelectorComponent } from '../base-search-selector/base-search-selector.component';

@Component({
    selector: `os-list-search-selector`,
    templateUrl: `../base-search-selector/base-search-selector.component.html`,
    styleUrls: [`../base-search-selector/base-search-selector.component.scss`, `./list-search-selector.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: ListSearchSelectorComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ListSearchSelectorComponent extends BaseSearchSelectorComponent {
    private _inputListValuesSubscription: Subscription;

    /**
     * The inputlist subject. Subscribes to it and updates the selector, if the subject
     * changes its values.
     */
    @Input()
    public set inputListValues(value: Selectable[] | Observable<Selectable[]>) {
        if (!value) {
            return;
        }
        if (this._inputListValuesSubscription) {
            this._inputListValuesSubscription.unsubscribe();
        }
        if (Array.isArray(value)) {
            this.selectableItems = value;
        } else {
            this._inputListValuesSubscription = value.pipe(auditTime(10), distinctUntilChanged()).subscribe(items => {
                this.selectableItems = items;
                if (this.contentForm) {
                    this.disabled =
                        (this.disabled || !items || (!!items && !items.length)) && !this.clickNotFound.observed;
                }
            });
            this.subscriptions.push(this._inputListValuesSubscription);
        }
    }

    public readonly controlType = `list-search-selector`;

    public constructor(@Optional() @Self() ngControl: NgControl) {
        super(ngControl);
    }
}
