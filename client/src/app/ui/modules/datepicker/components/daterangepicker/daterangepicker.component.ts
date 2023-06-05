import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Optional,
    Self,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NgControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldControl } from '@angular/material/form-field';
import { distinctUntilChanged, map } from 'rxjs';

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
    @ViewChild(`rangepicker`) rangepicker: MatDateRangePicker<Date>;

    public get empty(): boolean {
        return !this.value;
    }

    public override contentForm: UntypedFormGroup;

    private currentValue: any;

    constructor(
        formBuilder: UntypedFormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder, focusMonitor, element, ngControl);

        this.fm
            .monitor(element.nativeElement, true)
            .pipe(
                map(origin => !!origin),
                distinctUntilChanged()
            )
            .subscribe(focused => {
                if (focused) {
                    this.rangepicker.open();
                }
            });
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
