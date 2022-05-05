import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Component,
    Input,
    Self,
    Optional,
    ElementRef,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, NgControl } from '@angular/forms';
import { auditTime, Observable, distinctUntilChanged } from 'rxjs';
import { Selectable } from '../../../../../domain/interfaces/selectable';
import { BaseSearchSelectorComponent } from '../base-search-selector/base-search-selector.component';
import { MatFormFieldControl } from '@angular/material/form-field';

@Component({
    selector: 'os-list-search-selector',
    templateUrl: '../base-search-selector/base-search-selector.component.html',
    styleUrls: ['../base-search-selector/base-search-selector.component.scss', './list-search-selector.component.scss'],
    providers: [{ provide: MatFormFieldControl, useExisting: ListSearchSelectorComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSearchSelectorComponent extends BaseSearchSelectorComponent {
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
                value.pipe(auditTime(10), distinctUntilChanged()).subscribe(items => {
                    this.selectableItems = items;
                    if (this.contentForm) {
                        this.disabled = !items || (!!items && !items.length);
                    }
                })
            );
        }
    }

    public readonly controlType = `list-search-selector`;

    public constructor(
        formBuilder: FormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }
}
