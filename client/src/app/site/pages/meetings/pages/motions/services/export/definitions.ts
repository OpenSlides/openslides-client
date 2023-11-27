import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
/**
 * Type declaring which strings are valid options for metainfos to be exported into a pdf
 */
export type InfoToExport =
    | 'state'
    | 'recommendation'
    | 'category_name'
    | 'category_prefix'
    | 'block'
    | 'tags'
    | 'polls'
    | 'speakers'
    | 'id'
    | 'sequential_number'
    | 'referring_motions'
    | 'allcomments'
    | 'motion_amendment'
    | 'submitters_verbose'
    | 'supporters_verbose'
    | 'submitters_username'
    | 'supporters_username';

/**
 * Determines the possible file format of a motion export
 */
export enum ExportFileFormat {
    PDF = 1,
    CSV,
    XLSX
}

/**
 * import-export order specific constants
 */
const motionHeadersAndVerboseNames: { [key in keyof ViewMotion]?: any } = {
    number: `Number`,
    submitters_verbose: `Submitter full names`,
    supporters_verbose: `Supporter full names`,
    submitters_username: `Submitter usernames`,
    supporters_username: `Supporter usernames`,
    title: `Title`,
    text: `Text`,
    reason: `Reason`,
    category_name: `Category name`,
    category_prefix: `Category_prefix`,
    tags: `Tags`,
    block: `Motion block`,
    recommendation: `Recommendation`,
    state: `State`,
    sequential_number: `Sequential number`,
    motion_amendment: `Amendment status`
};

/**
 * Defines the column order for csv/xlsx export/import of motions.
 */
export const motionImportExportHeaderOrder: (keyof ViewMotion)[] = Object.keys(motionHeadersAndVerboseNames) as any;

/**
 * hints the metaData. This data will be excluded from the meta-data list in the export dialog.
 * Order of this does not matter
 */
export const noMetaData: (keyof ViewMotion)[] = [`number`, `title`, `text`, `reason`];

/**
 * Subset of {@link motionImportExportHeaderOrder} properties that are
 * restricted to export only due to database or workflow limitations
 */
const motionExportOnly: (keyof ViewMotion)[] = [`id`, `sequential_number`, `recommendation`, `state`];

export const motionExpectedHeaders: (keyof ViewMotion)[] = motionImportExportHeaderOrder.filter(
    header => !motionExportOnly.includes(header)
);

export const motionImportFields: { [key in keyof ViewMotion]?: any } = Object.fromEntries(
    Object.entries(motionHeadersAndVerboseNames).filter(
        entry => !motionExportOnly.includes(entry[0] as keyof ViewMotion)
    )
);

/**
 * reorders the exported properties according to motionImportExportHeaderOrder
 *
 * @param propertyList A list of motion properties to be ordered
 */
export function sortMotionPropertyList(propertyList: string[]): string[] {
    return motionImportExportHeaderOrder.filter(property => propertyList.includes(property));
}

export function getVerboseNameOfMotionProperty(propertyName: keyof ViewMotion): string {
    return motionHeadersAndVerboseNames[propertyName];
}

export function getMotionExportHeadersAndVerboseNames(): { [key: string]: string } {
    return motionExpectedHeaders.mapToObject(item => ({ [item]: getVerboseNameOfMotionProperty(item) }));
}
