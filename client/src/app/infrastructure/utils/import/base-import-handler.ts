import { ImportContext, SharedImportContext } from './import-context';
import { ImportModel } from './import-model';
import { ImportStep, ImportStepDescriptor, ImportStepPhase } from './import-step';
import { CsvMapping, ImportCleanup } from './import-utils';

export interface ImportHandler<ToCreate = any> extends ImportStep, ImportCleanup {
    pipeModels(importModels: ImportModel<ToCreate>[]): void;
    doImport(): void | Promise<void>;
}

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export interface BaseImportHandlerConfig<MainModel = any, SideModel = any> {
    /**
     * A descriptive name for the models created by this helper. If a `label` is given, the label is used over the descriptive name.
     */
    verboseNameFn?: string | ((plural?: boolean) => string);
    /**
     * A complete label for an import handler. This will be used over a `verboseNameFn` (if given). this can also be a function.
     */
    labelFn?: string | ((phase: ImportStepPhase, plural?: boolean) => string);
    /**
     * Sets the chunk size to an immutable value.
     */
    fixedChunkSize?: number;
    /**
     * This function can be used to transform any entries into objects, that are directly forced to the import
     * function.
     */
    transformFn?: TransformFn<MainModel, SideModel>;
    translateFn?: (key: string) => string;
}

type TransformFn<MainModel, SideModel> = <K>(sideModels: CsvMapping<SideModel>[], mainModels: MainModel[]) => K[];

export abstract class BaseImportHandler<MainModel = any, SideModel = any> implements ImportHandler<MainModel> {
    public get phase(): ImportStepPhase {
        return this.importContext.phase;
    }

    protected get chunkSize(): number {
        return this._fixedChunkSize ?? this._chunkSize;
    }

    protected readonly importContext = new ImportContext<MainModel>();

    private readonly _chunkSize = 100;
    private readonly _fixedChunkSize: number;
    private readonly _importStepDescriptor: ImportStepDescriptor;
    private readonly _transformFn: TransformFn<MainModel, SideModel>;

    public constructor(config: BaseImportHandlerConfig<MainModel, SideModel>) {
        this._importStepDescriptor = new ImportStepDescriptor({
            verboseNameFn: config.verboseNameFn,
            labelFn: config.labelFn,
            translateFn: config.translateFn
        });
        this._fixedChunkSize = config.fixedChunkSize ?? 100;
        this._transformFn = config.transformFn ?? ((models): any => models as any);
    }

    public startImport(): void {
        this.nextStep(ImportStepPhase.PENDING);
    }

    public finishImport(): void {
        this.nextStep(ImportStepPhase.FINISHED);
    }

    public pipeModels(importModels: ImportModel<MainModel>[]): void {
        this.importContext.models = importModels.map(importModel => importModel.model);
    }

    public getDescription(): string {
        return this._importStepDescriptor.getDescription(this.phase, this.getModelsToCreateAmount() !== 1);
    }

    public doCleanup(): void {
        this.importContext.models = [];
        this.importContext.modelsImported = [];
        this.importContext.phase = ImportStepPhase.ENQUEUED;
    }

    protected doTransformModels(models: CsvMapping<SideModel>[]): any[] {
        return this._transformFn(models, this.importContext.models);
    }

    protected nextStep(step: ImportStepPhase): void {
        this.importContext.phase = step;
    }

    protected getImportContext(): SharedImportContext {
        return this.importContext.getSharedContext();
    }

    public abstract getModelsToCreateAmount(): number;
    public abstract getModelsImportedAmount(): number;
    public abstract doImport(): Promise<void>;
}
