import { Constructable } from 'src/app/domain/interfaces/constructable';

import { DataType } from './data-type';

type ClassDecorator = (target: Constructable) => void;

interface DtoPropertyOptions {
    isArray?: boolean;
    isRequired?: boolean;
    defaultValue?: any;
}

interface DtoPropertyDescription extends DtoPropertyOptions {
    name: string;
    dataType: DataType;
}

interface DtoClassDescription {
    [propertyName: string]: DtoPropertyDescription;
}

function getSanitizedDate(propertyName: string, description: DtoPropertyDescription, date: any): any {
    if (description.isRequired && !date) {
        if (description.defaultValue) {
            return description.defaultValue;
        } else {
            throw new Error(`${propertyName} is required!`);
        }
    }
    if (description.isArray && !Array.isArray(date)) {
        if (date === null) {
            return [];
        } else {
            return [date];
        }
    }
    if (description.isArray) {
        return date.flatMap((value: any) => getSanitizedDate(propertyName, description, value));
    }
    if (!!date && description.dataType !== typeof date) {
        throw new Error(`${propertyName} has to be of type ${description.dataType}, received ${typeof date}!`);
    }
}

class DtoContainer {
    private static dtoMap: { [className: string]: DtoClassDescription } = {};

    public static addPropertyDescriptionFor(className: string, description: DtoPropertyDescription): void {
        const dtoClassDescription = this.getClassDescriptionFor(className);
        dtoClassDescription[description.name] = description;
        this.dtoMap[className] = dtoClassDescription;
    }

    public static getClassDescriptionFor(className: string): DtoClassDescription {
        if (!this.dtoMap[className]) {
            this.dtoMap[className] = {};
        }
        return this.dtoMap[className];
    }
}

export function DtoClass(): ClassDecorator {
    return (_: Constructable) => {};
}

export function DtoClassProperty(fnName: string, dataType: DataType, options: DtoPropertyOptions = {}): any {
    return (_: Constructable, propertyName: string) => {
        DtoContainer.addPropertyDescriptionFor(fnName, {
            name: propertyName,
            dataType,
            ...options
        });
    };
}

export function ValidateDtoFor(fnName: string, dataArgumentIndex = 0): any {
    return (_: Constructable, methodName: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        const description = DtoContainer.getClassDescriptionFor(fnName);
        descriptor.value = function (...args: any[]) {
            const data = args[dataArgumentIndex]; // Suppose that the data is the first argument
            const payload: any = {};
            for (const propertyName of Object.keys(description)) {
                payload[propertyName] = getSanitizedDate(propertyName, description[propertyName], data[propertyName]);
            }
            args.splice(dataArgumentIndex, 1, payload);
            return fn.apply(this, args);
        };
    };
}
