import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, HostBinding, Input, OnDestroy, Optional, Self } from '@angular/core';
import {
    ControlValueAccessor,
    NgControl,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';

/**
 * Abstract class to implement some simple logic and provide the subclass as a controllable
 * form-control in `MatFormField`.
 *
 * Please remember to prepare the `providers` in the `@Component`-decorator. Something like:
 *
 * ```ts
 * @Component({
 *   selector: ...,
 *   templateUrl: ...,
 *   styleUrls: [...],
 *   providers: [{ provide: MatFormFieldControl, useExisting: <TheComponent>}]
 * })
 * ```
 */
@Directive()
export abstract class BaseFormFieldControlComponent<T>
    implements MatFormFieldControl<T>, OnDestroy, ControlValueAccessor
{
    public static nextId = 0;

    @HostBinding() public id = `base-form-control-${BaseFormFieldControlComponent.nextId++}`;

    @HostBinding(`class.floating`) public get shouldLabelFloat(): boolean {
        return (this.focused || !this.empty) && !this.disabled;
    }

    @HostBinding(`attr.aria-describedby`) public describedBy = ``;

    @Input()
    public set value(value: T | null) {
        this.updateForm(value);
        this.stateChanges.next();
    }

    public get value(): T | null {
        return this.contentForm.value;
    }

    @Input()
    public set placeholder(placeholder: string) {
        this._placeholder = placeholder;
        this.stateChanges.next();
    }

    public get placeholder(): string {
        return this._placeholder;
    }

    @Input()
    public set required(required: boolean) {
        this._required = coerceBooleanProperty(required);
        this.stateChanges.next();
    }

    public get required(): boolean {
        return this._required;
    }

    @Input()
    public set disabled(disable: boolean) {
        this._disabled = coerceBooleanProperty(disable);
        if (this._disabled) {
            this.contentForm.disable();
        } else {
            this.contentForm.enable();
        }
        this.stateChanges.next();
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    public shouldPropagateOnRegistering = true;

    public abstract get empty(): boolean;

    public abstract get controlType(): string;

    public contentForm: UntypedFormControl | UntypedFormGroup;

    public stateChanges = new Subject<void>();

    public errorState = false;

    public focused = false;

    private _placeholder = ``;

    private _required = false;

    private _disabled = false;

    protected subscriptions: Subscription[] = [];

    public constructor(
        protected fb: UntypedFormBuilder,
        protected fm: FocusMonitor,
        protected element: ElementRef<HTMLElement>,
        @Optional() @Self() public ngControl: NgControl
    ) {
        this.contentForm = this.createForm();
        this.initializeForm();

        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }

        this.subscriptions.push(
            fm.monitor(element.nativeElement, true).subscribe(origin => {
                this.focused = origin === `mouse` || origin === `touch`;
                this.stateChanges.next();
            }),
            this.contentForm.valueChanges.pipe(distinctUntilChanged()).subscribe(nextValue => this.push(nextValue))
        );
    }

    public ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];

        this.fm.stopMonitoring(this.element.nativeElement);

        this.stateChanges.complete();
    }

    ///////////////////////////////////////////////////////
    // Functions to fulfill the ControlValueAccessor interface
    ///////////////////////////////////////////////////////

    public writeValue(value: T): void {
        this.value = value;
    }
    public registerOnChange(fn: any): void {
        this._onChange = fn;
        if (this.shouldPropagateOnRegistering) {
            this.push(this.value);
        }
    }
    public registerOnTouched(fn: any): void {
        this._onTouched = fn;
        if (this.shouldPropagateOnRegistering) {
            this.push(this.value);
        }
    }
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    public setDescribedByIds(ids: string[]): void {
        this.describedBy = ids.join(` `);
    }

    public abstract onContainerClick(event: MouseEvent): void;

    protected _onChange: (_value: T | null) => void = () => {};

    protected _onTouched: (_value: T | null) => void = () => {};

    protected abstract initializeForm(): void;

    protected abstract createForm(): UntypedFormControl | UntypedFormGroup;

    protected abstract updateForm(value: T | null): void;

    protected push(value: T | null): void {
        this._onChange(value);
        this._onTouched(value);
    }
}
