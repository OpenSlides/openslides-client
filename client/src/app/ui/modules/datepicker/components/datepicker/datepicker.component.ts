import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { BaseDatepickerComponent } from '../base-datepicker/base-datepicker.component';

@Component({
    selector: `os-datepicker`,
    templateUrl: `./datepicker.component.html`,
    styleUrls: [`./datepicker.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: DatepickerComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DatepickerComponent extends BaseDatepickerComponent {
    public get empty(): boolean {
        return !this.value;
    }

    public override contentForm: UntypedFormControl;

    protected createForm(): UntypedFormControl {
        return this.fb.control(null);
    }

    protected updateForm(value: any | null): void {
        this.contentForm.setValue(value);
    }
}
