import { ChangeDetectionStrategy, Component, ElementRef, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl, UntypedFormGroup } from '@angular/forms';
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

    private currentValue: any;

    public constructor(element: ElementRef<HTMLElement>, @Optional() @Self() ngControl: NgControl) {
        super(element, ngControl);
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

    protected override push(value: any): void {
        super.push(value);
        this.makeDatesValid();
    }

    private async makeDatesValid(): Promise<void> {
        setTimeout(() => {
            const value = this.contentForm.value;
            if ((value.start === null) !== (value.end === null)) {
                const newValue = value.start !== null ? value.start : value.end;
                this.updateForm({ start: newValue, end: newValue });
            } else if (value.start && value.end && value.start > value.end) {
                const newValue = this.currentValue.start !== value.start ? value.start : value.end;
                this.updateForm({ start: newValue, end: newValue });
            }
            this.currentValue = this.contentForm.value;
        }, 10);
    }
}
