import { Identifiable } from 'src/app/domain/interfaces';

import { Id } from '../../../domain/definitions/key-types';
import { SharedImportContext } from './import-context';
import { ImportModel } from './import-model';
import { StaticMainImportConfig } from './static-main-import-handler';

export interface ImportIdentifiable {
    id: number | null;
}

/**
 * Interface for value- Label combinations.
 */
export interface ValueLabelCombination {
    value: string;
    label: string;
}

export interface FileReaderProgressEvent extends ProgressEvent {
    readonly target: FileReader | null;
}

export interface BeforeFindAction<MainModel> {
    onBeforeFind: (allImportModels: ImportModel<MainModel>[]) => void | Promise<void>;
}

export function hasBeforeFindAction<MainModel>(instance: any): instance is BeforeFindAction<MainModel> {
    return typeof instance?.onBeforeFind === `function`;
}

/**
 * interface for a preview summary
 */
export interface ImportCSVPreview {
    total: number;
    duplicates: number;
    errors: number;
    new: number;
    done: number;
}

/**
 * Interface for correlating between strings representing BaseModels and existing
 * BaseModels.
 */
export type CsvMapping<T = any> = T & {
    name: string;
    willBeCreated?: boolean;
    id?: Id;
};

/**
 * The permitted states of a new entry. Only a 'new' entry should be imported
 * and then be set to 'done'.
 */
export type CsvImportStatus = 'new' | 'error' | 'done' | string;

export interface CsvJsonMapping {
    [key: string]: string;
}

export type RawObject<ToCreate> = { [key in keyof ToCreate]?: any };

export interface RawImportModel<ToCreate> extends Identifiable {
    readonly id: number;
    model: RawObject<ToCreate>;
}

export type ImportConfig<MainModel = any, K = any> = StaticMainImportConfig<MainModel> & {
    modelHeadersAndVerboseNames: K;
    requiredFields?: (keyof MainModel)[];
};

export interface ViaBackendImportConfig<MainModel = any, K = any> {
    modelHeadersAndVerboseNames: K;
}

export const DUPLICATE_IMPORT_ERROR = `Duplicates`;

export interface CsvValueParsingConfig<MainModel, SideModel> {
    importModel: ImportModel<MainModel>;
    allImportModels: ImportModel<MainModel>[];
    header: keyof MainModel;
    importFindHandler?: ImportFind<MainModel, SideModel>;
}

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
