import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PasswordValidator {
    public static validation(referenceControl: AbstractControl): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl) => {
            const isEqual = !control.value || !referenceControl.value || control.value === referenceControl.value;
            return isEqual ? null : { passwordMismatch: true };
        };
    }
}
