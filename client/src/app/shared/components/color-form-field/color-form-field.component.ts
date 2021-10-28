import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { BaseFormControlComponent } from '../base-form-control';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'os-color-form-field',
    templateUrl: './color-form-field.component.html',
    styleUrls: ['./color-form-field.component.scss'],
    providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ColorFormFieldComponent) }]
})
export class ColorFormFieldComponent extends BaseFormControlComponent<string> {
    @Input()
    public formControlName: string;

    @Input()
    public title: string;

    @Output()
    public reset = new EventEmitter<string>();

    @Output()
    public changed = new EventEmitter<string>();

    public onReset(): void {
        this.reset.emit(this.formControlName);
    }

    protected initializeForm(): void {
        this.contentForm = this.fb.control('');
    }

    protected updateForm(value: string): void {
        this.contentForm.setValue(value);
    }

    protected push(value: string): void {
        super.push(value);
        this.changed.emit(value);
    }
}
