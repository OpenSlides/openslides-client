import { ChangeDetectionStrategy, Component, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl, UntypedFormControl } from '@angular/forms';
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

    constructor(@Optional() @Self() ngControl: NgControl) {
        super(ngControl);
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control(null);
    }

    protected updateForm(value: any | null): void {
        this.contentForm.setValue(value);
    }
}
