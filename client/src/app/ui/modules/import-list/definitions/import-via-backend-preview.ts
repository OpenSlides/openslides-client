import { Identifiable } from 'src/app/domain/interfaces';

export enum ImportState {
    Error = `error`,
    Warning = `warning`,
    New = `new`,
    Done = `done`,
    Generated = `generated`
    // could be expanded later
}

export interface ImportViaBackendPreviewHeader {
    property: string; // field name/column title
    type: `boolean` | `number` | `string` | `date` | `object`; // date must be in format yyyy-mm-dd
    is_list: boolean; // optional, if not given defaults to `false`
}

export type ImportViaBackendPreviewModelData = null | boolean | number | string | ImportViaBackendPreviewObject;

export type ImportViaBackendPreviewObject = {
    value: boolean | number | string;
    info: ImportState;
    type: `boolean` | `number` | `string` | `date`;
};

export interface ImportViaBackendPreviewRow {
    state: ImportState;
    message: string[];
    data: {
        // property name and type must match an entry in the given `headers`
        [property: string]: ImportViaBackendPreviewModelData | ImportViaBackendPreviewModelData[]; // if is_list is set in corresponding header column, we need here also a list
    };
}

export type ImportViaBackendPreviewIndexedRow = ImportViaBackendPreviewRow & Identifiable;

export interface ImportViaBackendPreviewSummary {
    name: string; // text like "Total Number of Items", "Created", "Updated", depending the action
    value: number;
}

export interface ImportViaBackendPreview {
    id: number; // id of action_worker to import
    state: ImportState; // May be `error`, `warning` or `done`
    headers: ImportViaBackendPreviewHeader[];
    rows: ImportViaBackendPreviewRow[];
    statistics: ImportViaBackendPreviewSummary[];
}

export interface ImportViaBackendIndexedPreview {
    id: number; // id of action_worker to import
    state: ImportState; // May be `error`, `warning` or `done`
    headers: ImportViaBackendPreviewHeader[];
    rows: ImportViaBackendPreviewIndexedRow[];
    statistics: ImportViaBackendPreviewSummary[];
}

export function isImportViaBackendPreview(obj: any): obj is ImportViaBackendPreview {
    return (
        obj &&
        typeof obj === `object` &&
        typeof obj.id === `number` &&
        typeof obj.state === `string` &&
        Array.isArray(obj.headers) &&
        Array.isArray(obj.rows) &&
        Array.isArray(obj.statistics)
    );
}
