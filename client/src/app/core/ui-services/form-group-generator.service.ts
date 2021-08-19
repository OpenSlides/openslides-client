import { Injectable } from '@angular/core';

import {
    FormNameContainer,
    FormControlsConfig,
    FormControlType,
    FormClassControlOptions
} from '../decorators/form-class';
import { ValidatorFn, Validators } from '@angular/forms';
import { OperatorService } from '../core-services/operator.service';

@Injectable({
    providedIn: 'root'
})
export class FormGroupGeneratorService {
    public constructor(private operator: OperatorService) {}

    public generateFormGroup(
        namespace: string,
        additionalFormControls?: string[] | FormControlsConfig,
        updateForm?: { [controlName: string]: { validators?: ValidatorFn[]; defaultValue?: any } }
    ): { [controlName: string]: any[] } {
        const formControlsToResolve = FormNameContainer.get(namespace);
        const formGroup = {};
        for (const control of formControlsToResolve) {
            const { perms, cml, oml } = control.options as FormClassControlOptions;
            const formControl = this.getFormControlDescription(control.options);
            if (perms && !this.operator.hasPerms(...perms)) {
                continue;
            }
            if (oml && !this.operator.hasOrganizationPermissions(oml)) {
                continue;
            }
            if (cml && !this.operator.hasCommitteePermissions(cml.committeeId, cml.permission)) {
                continue;
            }
            formGroup[control.name] = formControl;
        }
        if (additionalFormControls) {
            this.appendAdditionalFormControls(formGroup, additionalFormControls);
        }
        if (updateForm) {
            this.updateFormGroup(formGroup, updateForm);
        }
        return formGroup;
    }

    private getFormControlDescription({
        required = false,
        validators = [],
        type = 'string'
    }: FormClassControlOptions): Array<unknown> {
        const validatorArray = validators;
        if (required) {
            validatorArray.push(Validators.required);
        }
        if (type === 'string') {
            return ['', validatorArray];
        }
        if (type === 'array') {
            return [[], validatorArray];
        }
        return [type, validatorArray];
    }

    private appendAdditionalFormControls(formGroup: object, formControls: string[] | FormControlsConfig): void {
        if (Array.isArray(formControls)) {
            for (const control of formControls) {
                formGroup[control] = [''];
            }
        } else {
            for (const [key, value] of Object.entries(formControls)) {
                formGroup[key] = value;
            }
        }
    }

    private updateFormGroup(formGroup: object, updateForm: { validators?: ValidatorFn[]; defaultValue?: any }): void {
        for (const controlName in updateForm) {
            if (updateForm[controlName].validators) {
                formGroup[controlName][1] = updateForm[controlName].validators;
            }
            if (updateForm[controlName].defaultValue) {
                formGroup[controlName][0] = updateForm[controlName].defaultValue;
            }
        }
    }
}
