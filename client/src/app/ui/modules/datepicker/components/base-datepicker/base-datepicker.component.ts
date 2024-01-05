import { Directive, ElementRef, inject, Input, Optional, Self, ViewChild } from '@angular/core';
import { NgControl } from '@angular/forms';
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
    public showUpdateSuccessIcon = false;

    protected override element = inject(ElementRef<HTMLElement>);
    constructor(@Optional() @Self() ngControl: NgControl) {
        super(ngControl);

        this.fm
            .monitor(this.element.nativeElement, true)
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

    public onContainerClick(_event: MouseEvent): void {}

    protected initializeForm(): void {}
}
