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
import { NgControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { BaseFormFieldControlComponent } from 'src/app/ui/base/base-form-field-control';

@Component({
    selector: `os-datepicker`,
    templateUrl: `./datepicker.component.html`,
    styleUrls: [`./datepicker.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: DatepickerComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent extends BaseFormFieldControlComponent<any> {
    public get empty(): boolean {
        return !this.value;
    }
    public readonly controlType = `os-datepicker`;

    public override contentForm!: UntypedFormControl;

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

    protected createForm(): UntypedFormGroup | UntypedFormControl {
        return this.fb.control(null);
    }

    protected updateForm(value: any | null): void {
        this.contentForm.setValue(value);
    }
}
