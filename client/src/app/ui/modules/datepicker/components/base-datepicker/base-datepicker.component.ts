import { Directive, Input, ViewChild } from '@angular/core';
import { MatDatepicker, MatDateRangePicker } from '@angular/material/datepicker';
import { KeyCode } from 'src/app/infrastructure/utils/key-code';
import { BaseFormFieldControlComponent } from 'src/app/ui/base/base-form-field-control';

@Directive()
export abstract class BaseDatepickerComponent extends BaseFormFieldControlComponent<any> {
    @ViewChild(`picker`) public picker: MatDateRangePicker<Date> | MatDatepicker<Date>;

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

    public onContainerClick(_event: MouseEvent): void {}

    public onKeyPressed(event: KeyboardEvent): void {
        if (event.code === KeyCode.ENTER) {
            this.picker.open();
        }
    }

    protected initializeForm(): void {}
}
