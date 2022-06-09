import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';

import { BaseFormControlComponent } from '../../../../base/base-form-control';

@Component({
    selector: `os-color-form-field`,
    templateUrl: `./color-form-field.component.html`,
    styleUrls: [`./color-form-field.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ColorFormFieldComponent) }]
})
export class ColorFormFieldComponent extends BaseFormControlComponent<string> {
    @Input()
    public formControlName: string = ``;

    @Input()
    public title: string = ``;

    @Output()
    public resetted = new EventEmitter<string>();

    @Output()
    public changed = new EventEmitter<string>();

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
        this.contentForm.setValue(value);
    }

    protected override push(value: string): void {
        super.push(value);
        this.changed.emit(value);
    }
}
