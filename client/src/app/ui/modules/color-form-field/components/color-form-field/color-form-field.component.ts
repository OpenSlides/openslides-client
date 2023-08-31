import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { BaseFormControlComponent } from '../../../../base/base-form-control';

@Component({
    selector: `os-color-form-field`,
    templateUrl: `./color-form-field.component.html`,
    styleUrls: [`./color-form-field.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ColorFormFieldComponent) }]
})
export class ColorFormFieldComponent extends BaseFormControlComponent<string> {
    @Input()
    public formControlName = ``;

    @Input()
    public title = ``;

    @Input()
    public set defaultDisplayColor(displayCol: Observable<string> | string) {
        if (this._defaultDisplayColorSubscription) {
            this._defaultDisplayColorSubscription.unsubscribe();
            this._defaultDisplayColorSubscription = undefined;
        }
        if (typeof displayCol === `string`) {
            this.setDefaultDisplayColor(displayCol);
        } else {
            this._defaultDisplayColorSubscription = displayCol.subscribe(col => this.setDefaultDisplayColor(col));
        }
    }
    public get defaultDisplayColor(): BehaviorSubject<string> {
        return this._defaultDisplayColor;
    }
    private _defaultDisplayColor = new BehaviorSubject<string>(``);

    private _defaultDisplayColorSubscription: Subscription;

    @Output()
    public resetted = new EventEmitter<string>();

    @Output()
    public changed = new EventEmitter<string>();

    public isEmpty = false;

    public get formControl(): UntypedFormControl {
        return this.contentForm as UntypedFormControl;
    }

    public onReset(): void {
        this.resetted.emit(this.formControlName);
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control(``);
    }

    protected updateForm(value: string): void {
        // Since this is only called when setting a new value from the outside, we don't need to check whether the value may be the default
        this.isEmpty = !value;
        if (this.isEmpty) {
            value = this.defaultDisplayColor.value;
        }
        this.contentForm.setValue(value);
    }

    protected override push(value: string): void {
        if (this.isEmpty) {
            if (value === this.defaultDisplayColor.value) {
                value = ``;
            } else if (!!value) {
                this.isEmpty = false;
            }
        }
        super.push(value);
        this.changed.emit(value);
    }

    private setDefaultDisplayColor(col: string) {
        this._defaultDisplayColor.next(col);
        if (this.isEmpty) {
            this.contentForm.setValue(col);
        }
    }
}
