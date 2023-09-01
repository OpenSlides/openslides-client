import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { BaseDatepickerComponent } from '../base-datepicker/base-datepicker.component';

@Component({
    selector: `os-datepicker`,
    templateUrl: `./datepicker.component.html`,
    styleUrls: [`./datepicker.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: DatepickerComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent extends BaseDatepickerComponent {
    public get empty(): boolean {
        return !this.value;
    }

    public override contentForm: UntypedFormControl;

    constructor(
        formBuilder: UntypedFormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control(null);
    }

    protected updateForm(value: any | null): void {
        this.contentForm.setValue(value);
    }
}
