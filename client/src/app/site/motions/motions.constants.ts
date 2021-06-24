/**
 * Central place for constants and enums for motions.
 */

/**
 * Determines the possible file format of a motion export
 */
export enum ExportFileFormat {
    PDF = 1,
    CSV,
    XLSX
}

/**
 * Special id to reference the personal note in a comments list
 */
export const PERSONAL_NOTE_ID = -1;

/**
 * Type declaring which strings are valid options for metainfos to be exported into a pdf
 */
export type InfoToExport =
    | 'submitters'
    | 'supporters'
    | 'state'
    | 'recommendation'
    | 'category'
    | 'block'
    | 'origin'
    | 'tags'
    | 'polls'
    | 'speakers'
    | 'id'
    | 'allcomments';

/**
 * The line numbering mode for the motion detail view.
 * The constants need to be in sync with the values saved in the config store.
 */
export enum LineNumberingMode {
    None = 'none',
    Inside = 'inline',
    Outside = 'outside'
}

/**
 * The change recommendation mode for the motion detail view.
 */
export enum ChangeRecoMode {
    Original = 'original',
    Changed = 'changed',
    Diff = 'diff',
    Final = 'agreed',
    ModifiedFinal = 'modified_final_version'
}

export enum AmendmentType {
    Amendment = 1,
    Parent,
    Lead
}

export const verboseChangeRecoMode = {
    original: 'Original version',
    changed: 'Changed version',
    diff: 'Diff version',
    agreed: 'Final version',
    modified_final_version: 'Final print template'
};

// import-export order specific constants

const motionHeadersAndVerboseNames = {
    number: 'Number',
    submitters: 'Submitters',
    supporters: 'Supporters',
    title: 'Title',
    text: 'Text',
    reason: 'Reason',
    category: 'Category',
    tags: 'Tags',
    motion_block: 'Motion block',
    recommendation: 'Recommendation',
    state: 'State'
};

/**
 * Defines the column order for csv/xlsx export/import of motions.
 */
export const motionImportExportHeaderOrder: string[] = Object.keys(motionHeadersAndVerboseNames);

/**
 * hints the metaData. This data will be excluded from the meta-data list in the export dialog.
 * Order of this does not matter
 */
export const noMetaData: string[] = ['number', 'title', 'text', 'reason'];

/**
 * Subset of {@link motionImportExportHeaderOrder} properties that are
 * restricted to export only due to database or workflow limitations
 */
export const motionExportOnly: string[] = ['id', 'recommendation', 'state'];

export const motionExpectedHeaders: string[] = motionImportExportHeaderOrder.filter(
    header => !motionExportOnly.includes(header)
);

/**
 * reorders the exported properties according to motionImportExportHeaderOrder
 *
 * @param propertyList A list of motion properties to be ordered
 */
export function sortMotionPropertyList(propertyList: string[]): string[] {
    return motionImportExportHeaderOrder.filter(property => propertyList.includes(property));
}

export function getVerboseNameOfMotionProperty(propertyName: string): string {
    return motionHeadersAndVerboseNames[propertyName];
}

export function getMotionExportHeadersAndVerboseNames(): { [key: string]: string } {
    return motionExpectedHeaders.mapToObject(item => ({ [item]: getVerboseNameOfMotionProperty(item) }));
}
