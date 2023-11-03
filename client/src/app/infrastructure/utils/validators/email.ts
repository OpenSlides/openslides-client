import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_VALIDATION_REGEX = /[A-Z0-9._+\-ÄÖÜ]+@[A-Z0-9.\-ÄÖÜ]+\.[A-ZÄÖÜ]{2,}/i;

export function createEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (!value) {
            return null;
        }

        const validEmail = EMAIL_VALIDATION_REGEX.test(value);
        if (!validEmail) {
            return { email: `Please enter a valid email address` };
        }
        return null;
    };
}
