import { Type } from '@angular/core';

class DataClassContainer {
    private static registry: { [descriptorKey: string]: any } = {};

    public static register(descriptor: string, value: Type<any>) {
        if (!this.registry[descriptor]) {
            this.registry[descriptor] = new value();
        }
    }

    public static get(descriptor: string): any | undefined {
        return this.registry[descriptor];
    }
}

export function DataClass(descriptor: string): any {
    return (target: Type<any>) => {
        DataClassContainer.register(descriptor, target);
    };
}

export function useDataClass(key: string, propertyIndex: number = 0): any {
    return (_target: Type<any>, _propertyKey: string, descriptor: TypedPropertyDescriptor<Function>): any => {
        const dataClass = DataClassContainer.get(key);
        if (!dataClass) {
            throw new Error('Undefined data class');
        }
        const method = descriptor.value;
        const toCopy = (value: any) => {
            const result = {};
            for (const key in dataClass) {
                result[key] = value[key];
            }
            return result;
        };
        descriptor.value = function (...args: any[]) {
            const value = args[propertyIndex];
            let result = null;
            if (Array.isArray(value)) {
                result = value.map(part => toCopy(part));
            } else {
                result = toCopy(value);
            }
            args.splice(propertyIndex, 1, result);
            return method.apply(this, args);
        };
    };
}
