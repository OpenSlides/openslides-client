import { FocusMonitor } from '@angular/cdk/a11y';
import { Directive, ElementRef, Input, Optional, Self, ViewChild } from '@angular/core';
import { NgControl, UntypedFormBuilder } from '@angular/forms';
import { MatDatepicker, MatDateRangePicker } from '@angular/material/datepicker';
import { distinctUntilChanged, map } from 'rxjs';
import { BaseFormFieldControlComponent } from 'src/app/ui/base/base-form-field-control';

@Directive()
export abstract class BaseDatepickerComponent extends BaseFormFieldControlComponent<any> {
    @ViewChild(`picker`) picker: MatDateRangePicker<Date> | MatDatepicker<Date>;

    public readonly controlType = `os-datepicker`;

    /**
     * A possible error send by the server.
     */
    @Input()
    public error: string | null = null;

    @Input()
    public title: string | null = null;

    @Input()
    public hintText: string | null = null;

    @Input()
    public showUpdateSuccessIcon: boolean = false;

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
                    this.picker.open();
                }
            });
    }

    public onContainerClick(event: MouseEvent): void {}

    protected initializeForm(): void {}
}
