import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

/**
 * Register a custom form control by providing it as NG_VALUE_ACCESSOR:
 *
 * @example
 * ```ts
 * Component ({
 *    selector: `os-custom-control`,
 *    templateUrl: `./custom-control.component.html`,
 *    styleUrls: [`./custom-control.component.scss`],
 *    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomControlComponent), multi: true }],
 * })
 * ```
 */
@Directive()
export abstract class BaseFormControlComponent<T> implements ControlValueAccessor, OnInit, OnDestroy {
    public static formControlId = 0;

    @Input()
    public set value(value: T | null) {
        this.updateForm(value);
        this.stateChanges.next();
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

    public get value(): T | null {
        return this.contentForm.value;
    }

    public get id(): number {
        return this._id;
    }

    public contentForm: FormControl | FormGroup;
    public stateChanges = new Subject<void>();

    protected subscriptions: Subscription[] = [];

    private readonly _id: number;
    private _disabled = false;

    public constructor(protected fb: FormBuilder) {
        this._id = ++BaseFormControlComponent.formControlId;
        this.initializeForm();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.contentForm.valueChanges.subscribe(nextValue => this.push(nextValue)));
    }

    public ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];

        this.stateChanges.complete();
    }

    public writeValue(value: T): void {
        this.value = value;
    }
    public registerOnChange(fn: any): void {
        this._onChange = fn;
        this.push(this.value);
    }
    public registerOnTouched(fn: any): void {
        this._onTouched = fn;
        this.push(this.value);
    }
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    protected _onChange = (value: T) => {};

    protected _onTouched = (value: T) => {};

    protected abstract initializeForm(): void;

    protected abstract updateForm(value: T | null): void;

    protected push(value: T): void {
        this._onChange(value);
        this._onTouched(value);
    }
}
