/**
 * Interface for correlating between strings representing BaseModels and existing
 * BaseModels.
 */
export interface CsvMapping {
    name: string;
    id?: number;
    multiId?: number[];
}
