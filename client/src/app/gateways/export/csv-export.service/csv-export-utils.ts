/**
 * Defines a csv column with a property of the model and an optional label. If this is not given, the
 * translated and capitalized property name is used.
 */
export interface BackendCsvColumnDefinitionProperty<T> {
    property: keyof T;
}

/**
 * Defines a csv column with a property of the model and an optional label. If this is not given, the
 * translated and capitalized property name is used.
 */
export interface CsvColumnDefinitionProperty<T> {
    label?: string;
    property: keyof T;
}

/**
 * Type assertion for CsvColumnDefinitionProperty<T>
 *
 * @param obj Any object to test.
 * @returns true, if the object is a property definition. This is also asserted for TypeScript.
 */
export function isPropertyDefinition<T>(obj: any): obj is CsvColumnDefinitionProperty<T> {
    return (<CsvColumnDefinitionProperty<T>>obj).property !== undefined;
}

/**
 * Defines a csv column with a map function. Here, the user of this service can define hat should happen with
 * all the models. This map function is called for every model and the user should return a string that is
 * put into the csv. Also a column label must be given, that is capitalized and translated.
 */
export interface CsvColumnDefinitionMap<T> {
    label: string;
    map: (model: T) => string;
}

/**
 * Type assertion for CsvColumnDefinitionMap<T>
 *
 * @param obj Any object to test.
 * @returns true, if the objct is a map definition. This is also asserted for TypeScript.
 */
export function isMapDefinition<T>(obj: any): obj is CsvColumnDefinitionMap<T> {
    const columnDefinitionMap = <CsvColumnDefinitionMap<T>>obj;
    return columnDefinitionMap.map !== undefined && columnDefinitionMap.label !== undefined;
}

/**
 * The definition of columns in the export. Either use a property for every model or do a custom mapping to
 * a string to be put into the csv.
 */
export type CsvColumnsDefinition<T> = (CsvColumnDefinitionProperty<T> | CsvColumnDefinitionMap<T>)[];

/**
 * The definition of columns in the export. Either use a property for every model or do a custom mapping to
 * a string to be put into the csv.
 */
export type BackendCsvColumnsDefinition<T> = (BackendCsvColumnDefinitionProperty<T> | CsvColumnDefinitionMap<T>)[];

export const ISO_8859_15_ENCODING = `iso-8859-15`;
export const DEFAULT_LINE_SEPARATOR = `\r\n`;
export const DEFAULT_COLUMN_SEPARATOR = `,`;
export const DEFAULT_ENCODING = `utf-8`;
