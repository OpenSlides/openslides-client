import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Constant to validate a `duration` field.
 *
 * `([0-9]+)` looks for a number with any length to the `:` (optional).\n
 *
 * `([0-5][0-9]?)?`: The user can optionally enter a number for minutes/seconds (0 - 59)
 *
 * Afterwards the duration can be specified as hours or minutes (via `[h|m]?` - optional). Defaults to `h`.
 *
 * @param control The form-control to validate
 *
 * @returns {ValidationErrors | null} Null, if the input is correct, `ValidationErrors` otherwise.
 */
export const DurationValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const regExp = /^\s*([0-9]+)(:)?([0-5][0-9]?)?\s*[h|m]?$/g;
    return regExp.test(control.value) || control.value === `` ? null : { valid: false };
};
