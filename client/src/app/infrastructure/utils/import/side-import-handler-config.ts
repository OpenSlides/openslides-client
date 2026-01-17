import { BaseImportHandlerConfig } from './base-import-handler';
import { ImportRepository } from './import-repository';
import { CsvMapping, ImportIdentifiable } from './import-utils';

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export interface SideImportHandlerConfig<MainModel = any, SideModel = any> extends BaseImportHandlerConfig<
    MainModel,
    SideModel
> {
    /**
     * Force the usage of arrays instead of single items
     */
    useArray?: boolean;
    /**
     * A `BaseRepository` which provides functions to find and create models by this helper
     */
    repo?: ImportRepository<SideModel>;
    /**
     * Fields that are additionally passed to the create function to create models by this helper
     */
    additionalFields?: { key: keyof SideModel; value: unknown | (() => unknown) }[];
    /**
     * If the property the models found/created by this helper (specified by `idProperty`) expects an array,
     * this field can be defined a character, which will split the passed value. The default value is `,`.
     */
    nameDelimiter?: string;
    /**
     * Unknown models will be created through this function by this helper. The default value is `repo.create`
     * (therefore the `repo` field is required, if this function is not passed).
     */
    createFn?: (entries: CsvMapping<SideModel>[]) => Promise<ImportIdentifiable[]>;
    /**
     * Through this function known models are found by this helper. The default value is `repo.getViewModelList().find`
     * (therefore the `repo` field is required, if the function is not passed).
     */
    findFn?: (name: string, mainModel: MainModel) => SideModel | CsvMapping<SideModel>;
    /**
     * Function to manually determine if a model will be created or not.
     */
    shouldCreateModelFn?: (pseudoModel: CsvMapping<SideModel>, rawData: MainModel[]) => boolean;
}
