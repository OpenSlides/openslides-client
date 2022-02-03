import { CsvMapping } from 'app/core/ui-services/base-import.service';

import { SharedImportContext } from './import-context';
import { ImportModel } from './import-model';

export interface ImportFind<MainModel, SideModel> {
    findByName: (
        name: string,
        props: ImportFindProperties<MainModel>
    ) => CsvMapping<SideModel> | CsvMapping<SideModel>[];
}

export interface ImportFindProperties<MainModel> {
    importModel: ImportModel<MainModel>;
    allImportModels: ImportModel<MainModel>[];
}

export interface ImportResolveHandler<ReturnType = void> {
    doImport: () => ReturnType | Promise<ReturnType>;
}

export interface ImportCleanup {
    doCleanup: () => void;
}

export interface ImportResolveInformation<M> {
    model: M;
    unresolvedModels: number;
    verboseName?: string;
}

/**
 * Function, that receives an array of import models. Every import model contains an instance of `MainModel`.
 * `MainModel` is the type of a model an importer will primarly create.
 */
export type PipeModelsFn<MainModel = any> = (
    importModels: ImportModel<MainModel>[],
    context: SharedImportContext
) => void;

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export type DoImportFn<SideModel> = (models: CsvMapping<SideModel>[], context: SharedImportContext) => Promise<void>;
