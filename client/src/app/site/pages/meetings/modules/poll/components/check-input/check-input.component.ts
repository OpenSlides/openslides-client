import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-check-input`,
    templateUrl: `./check-input.component.html`,
    styleUrls: [`./check-input.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => CheckInputComponent) }]
})
export class CheckInputComponent extends BaseUiComponent implements OnInit, ControlValueAccessor {
    /**
     * Type of the used input.
     */
    @Input()
    public inputType = `text`;

    /**
     * The placeholder for the form-field.
     */
    @Input()
    public placeholder!: string;

    /**
     * The value received, if the checkbox is checked.
     */
    @Input()
    public checkboxValue!: number | string;

    /**
     * Label for the checkbox.
     */
    @Input()
    public checkboxLabel!: string;

    /**
     * Name of the radio group
     */
    @Input()
    public radioGroup: string;

    /**
     * Form element name
     */
    @Input()
    public formControlName: string;

    @Input()
    public set radioGroupValue(m: string) {
        this.checkboxStateChanged(m === this.formControlName);
    }

    /**
     * Model for the state of the checkbox.
     */
    public isChecked = false;

    /**
     * The form-control-reference.
     */
    public contentForm!: UntypedFormControl;

    /**
     * Default constructor.
     */
    public constructor(private formBuilder: UntypedFormBuilder) {
        super();
        this.initForm();
    }

    /**
     * OnInit.
     * Subscribes to value-changes of the form-control.
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.contentForm.valueChanges.subscribe(value => {
                this.sendValue(value);
            })
        );
    }

    /**
     * Function to handle checkbox-state-changed-event.
     */
    public checkboxStateChanged(checked: boolean): void {
        this.isChecked = checked;
        if (this.isChecked) {
            this.contentForm.disable({ emitEvent: false });
        } else {
            this.contentForm.enable({ emitEvent: false });
        }
        this.sendValue(this.contentForm.value);
    }

    /**
     * The value from the FormControl
     *
     * @param obj the value from the parent form. Type "any" is required by the interface
     */
    public writeValue(obj: string | number): void {
        if (obj || typeof obj === `number`) {
            if (obj === this.checkboxValue) {
                this.checkboxStateChanged(true);
            } else {
                this.contentForm.patchValue(obj);
            }
        }
    }

    /**
     * Hands changes back to the parent form
     *
     * @param fn the function to propagate the changes
     */
    public registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    /**
     * To satisfy the interface.
     *
     * @param fn
     */
    public registerOnTouched(fn: any): void {}

    /**
     * To satisfy the interface
     *
     * @param isDisabled
     */
    public setDisabledState?(isDisabled: boolean): void {}

    /**
     * Helper function to determine which information to give to the parent form
     */
    private propagateChange = (_: any) => {};

    /**
     * Initially build the form-control.
     */
    private initForm(): void {
        this.contentForm = this.formBuilder.control(``);
    }

    /**
     * Sends the given value by the propagateChange-funtion.
     *
     * @param value Optional parameter to pass a value to send.
     */
    private sendValue(value: string | number): void {
        if (this.isChecked) {
            this.propagateChange(this.checkboxValue);
        } else {
            this.propagateChange(value);
        }
    }
}
