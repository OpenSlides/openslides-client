/**
 * To hide columns via restriction
 */
export interface ColumnRestriction<P = any> {
    columnName: string;
    permission: P;
}
