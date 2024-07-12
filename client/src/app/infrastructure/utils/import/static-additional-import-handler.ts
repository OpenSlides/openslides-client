import { BaseAdditionalImportHandler } from './base-additional-import-handler';
import { BaseImportHandlerConfig } from './base-import-handler';
import { SharedImportContext } from './import-context';
import { ImportModel } from './import-model';
import { ImportProcess } from './import-process';
import { ImportStepPhase } from './import-step';
import { CsvMapping, DoImportFn, PipeModelsFn } from './import-utils';

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export interface StaticAdditionalImportHandlerConfig<MainModel, SideModel> extends BaseImportHandlerConfig {
    pipeModelsFn: PipeModelsFn<MainModel>;
    doImportFn: DoImportFn<SideModel>;
    getModelsToCreateAmountFn: (models: ImportModel<MainModel>[]) => number;
    getModelsImportedAmountFn: (nextChunk: MainModel[], oldValue: number) => number;

    pipeSideModelsFn?: (sideModels: CsvMapping<SideModel>[], context: SharedImportContext) => void;
}

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export class StaticAdditionalImportHandler<MainModel, SideModel> extends BaseAdditionalImportHandler<
    MainModel,
    SideModel
> {
    private readonly _pipeModelsFn: PipeModelsFn<MainModel>;
    private readonly _pipeSideModelsFn: (sideModels: CsvMapping<SideModel>[], context: SharedImportContext) => void;
    private readonly _doImportFn: DoImportFn<SideModel>;

    private readonly _getModelsToCreateAmountFn: (models: ImportModel<MainModel>[]) => number;
    private readonly _getModelsImportedAmountFn: (nextChunk: MainModel[], oldValue: number) => number;

    private _importProcess: ImportProcess<SideModel> | undefined;
    private _modelsToCreateAmount = 0;
    private _modelsImportedAmount = 0;
    private _sideModels: CsvMapping<SideModel>[] = [];

    public constructor(config: StaticAdditionalImportHandlerConfig<MainModel, SideModel>) {
        super(config);
        this._doImportFn = config.doImportFn;
        this._pipeModelsFn = config.pipeModelsFn;
        this._getModelsToCreateAmountFn = config.getModelsToCreateAmountFn;
        this._getModelsImportedAmountFn = config.getModelsImportedAmountFn;
        this._pipeSideModelsFn = config.pipeSideModelsFn || ((): void => {});
    }

    public override pipeModels(importModels: ImportModel<MainModel>[]): void {
        this._pipeModelsFn(importModels, this.getImportContext());
        super.pipeModels(importModels);
        this._modelsToCreateAmount = this._getModelsToCreateAmountFn(importModels);
    }

    public override pipeImportedSideModels(models: CsvMapping<SideModel>[]): void {
        this._sideModels = models;
        this._pipeSideModelsFn(models, this.getImportContext());
    }

    public async doImport(): Promise<void> {
        this.importContext.phase = ImportStepPhase.PENDING;
        try {
            this._importProcess = this.createImportProcess();
            await this.import();
            this.importContext.phase = ImportStepPhase.FINISHED;
        } catch (e) {
            console.log(`cannot execute import function:`, e);
            this.importContext.phase = ImportStepPhase.ERROR;
        }
    }

    public override doCleanup(): void {
        super.doCleanup();
        this._modelsImportedAmount = 0;
        this._modelsToCreateAmount = 0;
    }

    public getModelsToCreateAmount = (): number => this._modelsToCreateAmount;
    public getModelsImportedAmount = (): number => this._modelsImportedAmount;

    private createImportProcess(): ImportProcess<SideModel> {
        return new ImportProcess({
            importFn: models => this._doImportFn(models, this.getImportContext()),
            chunkSize: this.chunkSize,
            models: this.doTransformModels(this._sideModels),
            afterImportChunkFn: (nextChunk): void => {
                const oldValue = this._modelsImportedAmount;
                this.importContext.modelsImported = this.importContext.modelsImported.concat(nextChunk as any);
                this._modelsImportedAmount = this._getModelsImportedAmountFn(nextChunk as any, oldValue);
            }
        });
    }

    private async import(): Promise<void> {
        await this._importProcess!.doImport();
    }
}
