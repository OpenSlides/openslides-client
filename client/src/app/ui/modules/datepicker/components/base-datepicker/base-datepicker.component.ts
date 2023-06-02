import { FocusMonitor } from '@angular/cdk/a11y';
import { Directive, ElementRef, Input, Optional, Self } from '@angular/core';
import { NgControl, UntypedFormBuilder } from '@angular/forms';
import { BaseFormFieldControlComponent } from 'src/app/ui/base/base-form-field-control';

@Directive()
export abstract class BaseDatepickerComponent extends BaseFormFieldControlComponent<any> {
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
    }

    public onContainerClick(event: MouseEvent): void {}

    protected initializeForm(): void {}
}
