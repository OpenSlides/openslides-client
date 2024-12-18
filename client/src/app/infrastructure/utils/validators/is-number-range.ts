import { AbstractControl, ValidatorFn } from '@angular/forms';

export function isNumberRange(minCtrlName: string, maxCtrlName: string, errorName: string): ValidatorFn {
    return (formControl: AbstractControl): { [key: string]: any } | null => {
        const min = formControl.get(minCtrlName)!.value;
        const max = formControl.get(maxCtrlName)!.value;
        if (+min > +max || Number.isNaN(+min) || Number.isNaN(+max)) {
            return { [errorName]: true };
        }
        return null;
    };
}
