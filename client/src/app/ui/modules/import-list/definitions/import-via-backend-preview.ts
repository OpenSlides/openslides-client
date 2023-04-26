import { Identifiable } from 'src/app/domain/interfaces';

enum ImportState {
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

export type ImportViaBackendPreviewModelData =
    | null
    | boolean
    | number
    | string
    | {
          value: boolean | number | string;
          info: ImportState;
          type: `boolean` | `number` | `string` | `date`;
      };

export interface ImportViaBackendPreviewRow {
    status: ImportState;
    error: string[];
    data: {
        // property name and type must match an entry in the given `headers`
        [property: string]: ImportViaBackendPreviewModelData[]; // if is_list is set in corresponding header column, we need here also a list
    }[];
}

export type ImportViaBackendPreviewIndexedRow = ImportViaBackendPreviewRow & Identifiable;

export interface ImportViaBackendPreviewSummary {
    [text: string]: number; // text like "Total Number of Items", "Created", "Updated", depending the action
}

export interface ImportViaBackendPreview {
    id: number; // id of action_worker to import
    headers: ImportViaBackendPreviewHeader[];
    rows: ImportViaBackendPreviewRow[];
    statistics: ImportViaBackendPreviewSummary[];
}

export interface ImportViaBackendIndexedPreview {
    id: number; // id of action_worker to import
    headers: ImportViaBackendPreviewHeader[];
    rows: ImportViaBackendPreviewIndexedRow[];
    statistics: ImportViaBackendPreviewSummary[];
}

export interface ImportViaBackendJSONUploadResponse {
    success: boolean;
    message: string;
    results: ImportViaBackendPreview[];
}
