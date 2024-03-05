import { Collection, Field, Fqfield, Fqid, Id } from '../../domain/definitions/key-types';

const KEYSEPERATOR = `/`;

export function copy<T>(model: T, modelHeaders: (keyof T)[] = []): T {
    if (!modelHeaders.length) {
        modelHeaders = Object.keys(model) as (keyof T)[];
    }
    // @ts-ignore
    return modelHeaders.mapToObject(header => ({ [header]: model[header] })) as T;
}

export function deepCopy<T>(model: T): T {
    if (!model) {
        return model;
    }
    let tmp: any;
    if (Array.isArray(model)) {
        tmp = [];
        model.forEach((entry, index) => (tmp[index] = deepCopy(entry)));
    } else if (model instanceof Map) {
        return new Map(
            Array.from(model.entries()).map(entry => [deepCopy(entry[0]), deepCopy(entry[1])])
        ) as typeof model;
    } else if (model instanceof Date) {
        tmp = new Date(model);
    } else if (model instanceof Object) {
        tmp = {};
        Object.keys(model).forEach(key => (tmp[key] = deepCopy(model[key as keyof T])));
    } else {
        return model; // Assuming it's just a value
    }
    return tmp;
}

export function fqidFromCollectionAndId(collection: string, id: number | string): string {
    return `${collection}${KEYSEPERATOR}${id}`;
}

export function fqfieldFromCollectionIdField(collection: string, id: number | string, field: string): string {
    return `${collection}${KEYSEPERATOR}${id}${KEYSEPERATOR}${field}`;
}

export function collectionIdFromFqid(fqid: Fqid): [Collection, Id] {
    const parts = fqid.split(KEYSEPERATOR);
    if (parts.length !== 2) {
        throw new Error(`The given fqid "${fqid}" is not valid.`);
    }
    return [parts[0], +parts[1]];
}

export function idFromFqid(fqid: Fqid): Id {
    const parts = fqid.split(KEYSEPERATOR);
    if (parts.length !== 2) {
        throw new Error(`The given fqid "${fqid}" is not valid.`);
    }
    return +parts[1];
}

export function collectionIdFieldFromFqfield(fqfield: Fqfield): [Collection, Id, Field] {
    const parts = fqfield.split(KEYSEPERATOR) as any[];
    if (parts.length !== 3) {
        throw new Error(`The given fqfield "${fqfield}" is not valid.`);
    }
    parts[1] = +parts[1];
    return parts as [Collection, Id, Field];
}

export function collectionFromFqid(fqid: Fqid): Collection {
    return collectionIdFromFqid(fqid)[0];
}

export function isFqid(field: string): boolean {
    return new RegExp(`^[a-z_]+${KEYSEPERATOR}[1-9][0-9]*$`).test(field);
}
