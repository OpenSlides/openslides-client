import { Type } from '@angular/core';
import { Identifiable } from '../../shared/models/base/identifiable';

interface UsingDataClassOptions {
    injectId?: boolean;
}

interface DeclareDataClassOptions<T> {
    useOnly?: (keyof T)[];
    exclude?: (keyof T)[];
}

class DataClassContainer {
    private static registry: { [descriptorKey: string]: any } = {};
    private static propertiesToResolve: { [namespace: string]: string[] } = {};

    public static register(descriptor: string, value: Type<any>) {
        if (!this.registry[descriptor]) {
            this.registry[descriptor] = new value();
        }
    }

    public static get(descriptor: string): any {
        const dataClass = this.registry[descriptor];
        if (!dataClass) {
            throw new Error('Undefined data class');
        }
        return dataClass;
    }

    public static addDataClassPropertyForNamespaces(propertyKey: string, namespaces: string[]): void {
        for (const namespace of namespaces) {
            if (this.propertiesToResolve[namespace]) {
                this.propertiesToResolve[namespace].push(propertyKey);
            } else {
                this.propertiesToResolve[namespace] = [propertyKey];
            }
        }
    }

    public static resolveClassPropertiesForNamespaces(ctorName: string, namespaces: string[]): void {
        const resolveFn = (_namespaces: string[]) => {
            for (const namespace of _namespaces) {
                this.registry[namespace] = this.propertiesToResolve[namespace];
            }
        };
        if (namespaces.length > 0) {
            resolveFn(namespaces);
        } else {
            const allNamespaces = Object.keys(this.propertiesToResolve).filter(namespace =>
                new RegExp(`^${ctorName.toLowerCase()}.*$`).test(namespace)
            );
            resolveFn(allNamespaces);
        }
    }
}

export function DataClass<T>(descriptor: string, options?: DeclareDataClassOptions<T>): any {
    return (target: Type<T>) => {
        DataClassContainer.register(descriptor, target);
    };
}

export function DtoClass<T>(...namespaces: string[]): any {
    return (target: Type<T>) => {
        DataClassContainer.resolveClassPropertiesForNamespaces(target.name, namespaces);
    };
}

export function useDataClass(key: string, propertyIndex: number = 0, options: UsingDataClassOptions = {}): any {
    const { injectId = false }: UsingDataClassOptions = options;
    return (_target: Type<any>, _propertyKey: string, descriptor: TypedPropertyDescriptor<Function>): any => {
        const dataClass = DataClassContainer.get(key);
        const method = descriptor.value;
        const toCopy = (value: any, identifiable?: Identifiable) => {
            const result = {};
            for (const key in dataClass) {
                result[key] = value[key];
            }
            if (identifiable) {
                result['id'] = identifiable.id;
            }
            return result;
        };
        const getId = (args: any[]): Identifiable | Identifiable[] | null => {
            let identifiable = args.find(arg => {
                if (Array.isArray(arg)) {
                    if (arg.some(entry => entry.id)) {
                        return true;
                    }
                } else {
                    if (arg.id) {
                        return true;
                    }
                }
                return false;
            });
            return identifiable || null;
        };
        descriptor.value = function (...args: any[]) {
            const value = args[propertyIndex];
            let identifiables: Identifiable | Identifiable[] | null = null;
            if (injectId && !value.id) {
                identifiables = getId(args);
            }
            let result = null;
            if (Array.isArray(value)) {
                if (Array.isArray(identifiables)) {
                    result = value.map((part, index) => toCopy(part, identifiables[index]));
                } else {
                    result = value.map(part => toCopy(part, identifiables as Identifiable));
                }
            } else {
                if (Array.isArray(identifiables)) {
                    result = identifiables.map(identifiable => toCopy(value, identifiable));
                } else {
                    result = toCopy(value, identifiables);
                }
            }
            args.splice(propertyIndex, 1, result);
            return method.apply(this, args);
        };
    };
}

export function DataClassProperty(namespaces: string[] = [], targetName?: string): any {
    return (_target: Type<any>, propertyKey: string) => {
        if (namespaces.length > 0) {
            DataClassContainer.addDataClassPropertyForNamespaces(propertyKey, namespaces);
        } else {
            DataClassContainer.addDataClassPropertyForNamespaces(propertyKey, [
                targetName || _target.constructor.name.toLowerCase()
            ]);
        }
    };
}
