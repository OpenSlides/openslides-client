import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { isNumberRange } from './is-number-range';
import { isUniqueAmong } from './is-unique-among';

describe(`utils: validators`, () => {
    describe(`isNumberRange function`, () => {
        const validatorFn = isNumberRange(`min`, `max`);
        it(`test with correct values`, () => {
            const group = new UntypedFormGroup(
                {
                    min: new UntypedFormControl(0),
                    max: new UntypedFormControl(0)
                },
                validatorFn
            );
            expect(group.valid).toBe(true);
            group.get(`max`).setValue(3);
            expect(group.get(`max`).value).toBe(3);
            expect(group.valid).toBe(true);
            group.get(`min`).setValue(1);
            expect(group.valid).toBe(true);
            group.get(`min`).setValue(-1);
            expect(group.valid).toBe(true);
            group.get(`max`).setValue(`5`);
            expect(group.valid).toBe(true);
            group.get(`max`).setValue(Number.POSITIVE_INFINITY);
            expect(group.valid).toBe(true);
        });

        it(`test with incorrect values`, () => {
            const group = new UntypedFormGroup(
                {
                    min: new UntypedFormControl(1),
                    max: new UntypedFormControl(0)
                },
                validatorFn
            );
            expect(group.valid).toBe(false);
            group.get(`max`).setValue(-3);
            expect(group.get(`max`).value).toBe(-3);
            expect(group.valid).toBe(false);
            group.get(`max`).setValue(`test`);
            expect(group.valid).toBe(false);
        });
    });

    describe(`isUniqueAmong function`, () => {
        it(`test with number values`, () => {
            const control = new UntypedFormControl(0, isUniqueAmong([0, 2, 3, 5, 7, 9]));
            expect(control.valid).toBe(false);
            control.setValue(6);
            expect(control.valid).toBe(true);
            control.setValue(9);
            expect(control.valid).toBe(false);
        });

        it(`test with string values and ignoredValues`, () => {
            const control = new UntypedFormControl(
                ``,
                isUniqueAmong([``, `a`, `b`, `c`, `9`], (a, b) => a === b, [``, `c`])
            );
            expect(control.valid).toBe(true);
            control.setValue(`a`);
            expect(control.valid).toBe(false);
            control.setValue(`c`);
            expect(control.valid).toBe(true);
            control.setValue(`d`);
            expect(control.valid).toBe(true);
            control.setValue(9);
            expect(control.valid).toBe(true);
        });

        it(`test with custom isEqualFn`, () => {
            const control = new UntypedFormControl(
                ``,
                isUniqueAmong([``, `a`, `false`, `9`], (a, b) => typeof a === typeof b)
            );
            expect(control.valid).toBe(false);
            control.setValue(`a`);
            expect(control.valid).toBe(false);
            control.setValue(`c`);
            expect(control.valid).toBe(false);
            control.setValue(`d`);
            expect(control.valid).toBe(false);
            control.setValue(7);
            expect(control.valid).toBe(true);
            control.setValue(9);
            expect(control.valid).toBe(true);
        });
    });
});
