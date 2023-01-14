import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    Optional,
    Self,
    ViewEncapsulation
} from '@angular/core';
import { NgControl, UntypedFormBuilder } from '@angular/forms';
import { MatLegacyFormFieldControl as MatFormFieldControl } from '@angular/material/legacy-form-field';
import { auditTime, distinctUntilChanged, Observable } from 'rxjs';

import { Selectable } from '../../../../../domain/interfaces/selectable';
import { BaseSearchSelectorComponent } from '../base-search-selector/base-search-selector.component';

@Component({
    selector: `os-list-search-selector`,
    templateUrl: `../base-search-selector/base-search-selector.component.html`,
    styleUrls: [`../base-search-selector/base-search-selector.component.scss`, `./list-search-selector.component.scss`],
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
        formBuilder: UntypedFormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }
}
