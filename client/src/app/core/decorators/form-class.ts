import { Type } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { Permission } from '../core-services/permission';
import { CML, OML } from '../core-services/organization-permission';
import { Id } from '../definitions/key-types';

export type FormControlType = 'array' | 'string';

export type FormControlsConfig = {
    [formControl: string]: string | Array<unknown> | [string | Array<unknown>, ValidatorFn[]];
};

export interface FormClassControlOptions {
    required?: boolean;
    validators?: ValidatorFn[];
    type?: FormControlType | string | Array<unknown>;
    perms?: Permission[];
    cml?: { committeeId: Id; permission: CML };
    oml?: OML;
}

interface FormClassOptions {
    additionalFormControls?: string[] | FormControlsConfig;
}

export class FormNameContainer {
    static formControlsMap: { [namespace: string]: { name: string; options: FormClassControlOptions }[] } = {};
    static formGroupsMap: { [namespace: string]: { [formControl: string]: [string | Array<unknown>, ValidatorFn[]] } } =
        {};

    static registerFormControl(controlName: string, namespace: string, options: FormClassControlOptions): void {
        if (this.formControlsMap[namespace]) {
            this.formControlsMap[namespace].push({ name: controlName, options });
        } else {
            this.formControlsMap[namespace] = [{ name: controlName, options }];
        }
    }

    static registerFormClass(namespace: string, options: FormClassOptions): void {
        if (namespace.slice(-2) === ':*') {
            const namespaces = Object.keys(this.formControlsMap).filter(namespace =>
                new RegExp(`^${namespace}.*$`).test(namespace)
            );
            return namespaces.forEach(namespace => this.registerFormClass(namespace, options));
        }
        if (options.additionalFormControls) {
        }
        console.log('registered formControls', this.formControlsMap);
    }

    static get(namespace: string): any {
        return this.formControlsMap[namespace];
    }
}

export function FormClass(namespaces: string[] = [], options: FormClassOptions = {}): any {
    return (target: Type<any>): void => {
        if (namespaces.length > 0) {
            namespaces.forEach(namespace => FormNameContainer.registerFormClass(namespace, options));
        } else {
            FormNameContainer.registerFormClass(`${target.name}:*`, options);
        }
    };
}

export function FormClassControl(namespaces: string[], options: FormClassControlOptions = {}): any {
    return (_target: Type<any>, propertyKey: string): void => {
        namespaces.forEach(namespace => FormNameContainer.registerFormControl(propertyKey, namespace, options));
    };
}
