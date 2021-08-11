import { Collection, Field, Fqfield, Fqid, Id } from '../definitions/key-types';

export const KEYSEPERATOR = '/';

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

// E.g. (group_$_ids, 4) -> group_$4_ids
export function fillTemplateValueInTemplateField(field: Field, value: string): Field {
    return field.replace('$', '$' + value);
}
