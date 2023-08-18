import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Custom validator class
 * Several strings can be passed as `keys` of the form group.
 * This validator ensures that at least one of the fields behind the given keys has a value.
 */
export class OneOfValidator {
    /**
     * Function to confirm that at least one of the given form controls has a valid value.
     *
     * @param keys Undefined amount of form control names.
     *
     * @returns An error if all of these form controls have no valid values or null if at least one is filled.
     */
    public static validation(
        keys: string[],
        errorName = `noOneSet`
    ): (control: AbstractControl) => ValidationErrors | null {
        return (control: AbstractControl): ValidationErrors | null => {
            const formControls = keys.map(key => control.get(key));

            const noOneSet = formControls.every(formControl => !this.isControlValid(formControl!));

            return noOneSet ? { [errorName]: true } : null;
        };
    }

    private static isControlValid(control: AbstractControl): boolean {
        if (!control?.value) {
            return false;
        }
        if (Array.isArray(control.value) && !control.value.length) {
            return false;
        }
        return true;
    }
}
