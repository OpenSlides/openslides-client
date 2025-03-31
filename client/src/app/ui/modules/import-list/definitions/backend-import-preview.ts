import { Identifiable } from 'src/app/domain/interfaces';

export enum BackendImportState {
    Error = `error`,
    Warning = `warning`,
    New = `new`,
    Done = `done`,
    Generated = `generated`,
    Remove = `remove`
    // could be expanded later
}

export interface BackendImportHeader {
    property: string; // field name/column title
    type: `boolean` | `number` | `string` | `date`; // date must be in format yyyy-mm-dd
    is_list: boolean; // optional, if not given defaults to `false`
    is_object: boolean; // optional, if not given defaults to `false`
    is_hidden: boolean; // optional, if not given defaults to `false`
}

export type BackendImportEntry = null | boolean | number | string | BackendImportEntryObject;

export interface BackendImportEntryObject {
    value: boolean | number | string;
    info: BackendImportState;
    type: `boolean` | `number` | `string` | `date`;
}

export interface BackendImportRow {
    state: BackendImportState;
    messages: string[];
    data: Record<string, BackendImportEntry | BackendImportEntry[]>;
}

export type BackendImportIdentifiedRow = BackendImportRow & Identifiable;

export interface BackendImportSummary {
    name: string; // text like "Total Number of Items", "Created", "Updated", depending the action
    value: number;
}

export interface BackendImportRawPreview {
    id?: number; // id of action_worker to import
    state: BackendImportState; // May be `error`, `warning` or `done`
    headers?: BackendImportHeader[];
    rows: BackendImportRow[];
    statistics?: BackendImportSummary[];
}

export interface BackendImportPreview {
    id: number; // id of action_worker to import
    state: BackendImportState; // May be `error`, `warning` or `done`
    headers: BackendImportHeader[];
    rows: BackendImportIdentifiedRow[];
    statistics: BackendImportSummary[];
}

export function isBackendImportRawPreview(obj: any): obj is BackendImportRawPreview {
    return (
        obj &&
        typeof obj === `object` &&
        (!obj.id || typeof obj.id === `number`) &&
        typeof obj.state === `string` &&
        (!obj.headers || Array.isArray(obj.headers)) &&
        Array.isArray(obj.rows) &&
        (!obj.statistics || Array.isArray(obj.statistics))
    );
}
