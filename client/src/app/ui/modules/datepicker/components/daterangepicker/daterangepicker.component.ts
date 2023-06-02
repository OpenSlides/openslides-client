import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { BaseDatepickerComponent } from '../base-datepicker/base-datepicker.component';
import { DatepickerComponent } from '../datepicker/datepicker.component';

@Component({
    selector: `os-daterangepicker`,
    templateUrl: `./daterangepicker.component.html`,
    styleUrls: [`./daterangepicker.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: DatepickerComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaterangepickerComponent extends BaseDatepickerComponent {
    public get empty(): boolean {
        return !this.value;
    }

    public override contentForm: UntypedFormGroup;

    constructor(
        formBuilder: UntypedFormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }

    protected createForm(): UntypedFormGroup {
        return this.fb.group({
            start: [null],
            end: [null]
        });
    }

    protected updateForm(value: any | null): void {
        this.contentForm.patchValue(value);
    }
}
