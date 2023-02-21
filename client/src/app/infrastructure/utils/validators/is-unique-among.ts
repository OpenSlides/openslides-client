import { AbstractControl, ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

export function isUniqueAmong<T>(
    preExistingValues: T[] | BehaviorSubject<T[]>,
    isEqualFn: (a: T, b: T) => boolean = (a, b) => a === b,
    ignoredValues: T[] = []
): ValidatorFn {
    return (formControl: AbstractControl): { [key: string]: any } | null => {
        const a = formControl.value as T;
        if (ignoredValues.includes(a)) {
            return null;
        }

        const bValues = Array.isArray(preExistingValues) ? preExistingValues : preExistingValues.value;
        if (bValues.length && bValues.some(b => isEqualFn(a, b))) {
            return { notUniqueError: true };
        }
        return null;
    };
}
