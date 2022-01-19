import { CsvMapping, ImportStepPhase } from '../../../core/ui-services/base-import.service';
import { Identifiable } from '../../models/base/identifiable';

interface ImportRepository<T> {
    create(...entries: T[]): Promise<Identifiable[]>;
    getViewModelList(): T[];
    getVerboseName(plural?: boolean): string;
}

export interface ImportHandlerConfig<ToCreate = any, ToImport = any> {
    /**
     * Force the usage of arrays instead of single items
     */
    useArray?: boolean;
    /**
     * A `BaseRepository` which provides functions to find and create models by this helper
     */
    repo?: ImportRepository<ToImport>;
    /**
     * A descriptive name for the models created by this helper
     */
    verboseNameFn?: string | ((plural?: boolean) => string);
    labelFn?: string | ((phase: ImportStepPhase) => string);
    /**
     * Fields that are additionally passed to the create function to create models by this helper
     */
    additionalFields?: { key: keyof ToImport; value: unknown | (() => unknown) }[];
    /**
     * If the property the models found/created by this helper (specified by `idProperty`) expects an array,
     * this field can be defined a character, which will split the passed value. The default value is `,`.
     */
    nameDelimiter?: string;
    /**
     * Sets the chunk size to an immutable value.
     */
    fixedChunkSize?: number;
    /**
     * This function can be used to transform any entries into objects, that are directly forced to the import
     * function.
     */
    transformFn?: (entries: CsvMapping<ToImport>[], originalEntries: ToCreate[]) => CsvMapping[];
    /**
     * Unknown models will be created through this function by this helper. The default value is `repo.create`
     * (therefore the `repo` field is required, if this function is not passed).
     */
    createFn?: (entries: CsvMapping<ToImport>[] /* , originalEntries: ToCreate[] */) => Promise<Identifiable[]>;
    /**
     * Through this function known models are found by this helper. The default value is `repo.getViewModelList().find`
     * (therefore the `repo` field is required, if the function is not passed).
     */
    findFn?: (name: string, originalEntry: ToCreate) => ToImport | CsvMapping<ToImport>;
}
