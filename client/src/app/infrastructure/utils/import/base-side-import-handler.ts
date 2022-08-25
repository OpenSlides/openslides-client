import { BehaviorSubject, Observable } from 'rxjs';

import { BaseImportHandler, ImportHandler } from './base-import-handler';
import { ImportProcess } from './import-process';
import { ImportStepPhase } from './import-step';
import { CsvMapping, ImportFind, ImportFindProperties, ImportIdentifiable, ImportResolveHandler } from './import-utils';
import { SideImportHandlerConfig } from './side-import-handler-config';

type CreateFn<E> = (entries: E[]) => Promise<ImportIdentifiable[]>;
type FindFn<E, O> = (name: string, originalEntry: O) => E;

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export interface SideImportHandler<MainModel, SideModel = any>
    extends ImportHandler<MainModel>,
        ImportFind<MainModel, SideModel>,
        ImportResolveHandler {
    getModelsToCreate(): CsvMapping<SideModel>[];
}

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export interface BaseSideImportHandlerConfig<MainModel = any, SideModel = any>
    extends SideImportHandlerConfig<MainModel, SideModel> {
    idProperty: keyof MainModel;
    translateFn?: (value: string) => string;
}

/**
 * `MainModel` is the type of a model an importer will primarly create. `SideModel` is the type of a model which will
 * be created, too, but as a "side effect" during the import process of the main models.
 */
export abstract class BaseSideImportHandler<MainModel, SideModel>
    extends BaseImportHandler<MainModel, SideModel>
    implements SideImportHandler<MainModel, SideModel>
{
    public get modelsToCreateObservable(): Observable<CsvMapping<SideModel>[]> {
        return this._modelsToCreateSubject.asObservable();
    }

    public get phaseObservable(): Observable<ImportStepPhase> {
        return this.importContext.phaseObservable;
    }

    protected set modelsToCreate(next: CsvMapping<SideModel>[]) {
        this._modelsToCreateSubject.next(next);
    }

    protected get modelsToCreate(): CsvMapping<SideModel>[] {
        return this._modelsToCreateSubject.value;
    }

    protected get isArray(): boolean {
        return this._isArrayProperty || this._useArray;
    }

    protected readonly translateFn: (value: string) => string;
    protected readonly idProperty: keyof MainModel;

    private readonly _modelsToCreateSubject = new BehaviorSubject<CsvMapping<SideModel>[]>([]);

    private _createFn!: (entries: CsvMapping<SideModel>[]) => Promise<ImportIdentifiable[]>;
    private _findFn!: (name: string, originalEntry: MainModel) => SideModel | CsvMapping<SideModel>;
    private _shouldCreateModelFn: (pseudoModel: CsvMapping<SideModel>, rawData: MainModel[]) => boolean;
    private _additionalFields: { key: keyof SideModel; value: unknown | (() => unknown) }[];
    private _nameDelimiter: string;
    private _useArray: boolean;

    private _isArrayProperty = false;
    private _importProcess!: ImportProcess<SideModel>;

    public constructor(config: BaseSideImportHandlerConfig<MainModel, SideModel>) {
        super({ ...config, verboseNameFn: config.verboseNameFn ?? config.repo?.getVerboseName });
        this.idProperty = config.idProperty;
        this.translateFn = config.translateFn || (value => value);
        this._useArray = config.useArray ?? false;
        this._additionalFields = config.additionalFields ?? [];
        this._nameDelimiter = config.nameDelimiter ?? `,`;
        this._shouldCreateModelFn = config.shouldCreateModelFn ?? (() => true);

        this.setCreateFn(config.createFn as any, config.repo);
        this.setFindFn(config.findFn, config.repo);

        if ((this.idProperty as string).slice(-3) === `ids`) {
            this._isArrayProperty = true;
        }
    }

    public override doCleanup(): void {
        this.modelsToCreate = [];
        this.nextStep(ImportStepPhase.ENQUEUED);
        this._importProcess?.cleanUp();
    }

    public async doImport(): Promise<void> {
        if (!this._createFn) {
            throw new Error(`No function to create models is defined`);
        }
        this.nextStep(ImportStepPhase.PENDING);
        this._importProcess = this.createImportProcess();
        if (this.modelsToCreate.length) {
            await this.import();
        }
        this.nextStep(ImportStepPhase.FINISHED);
    }

    public getModelsImportedAmount(): number {
        return this._importProcess ? this._importProcess.modelsImportedAmount : 0;
    }

    public getModelsToCreateAmount(): number {
        return this.modelsToCreate.length;
    }

    public getModelsToCreate(): CsvMapping<SideModel>[] {
        return this.modelsToCreate;
    }

    public findByName(
        name: string,
        props: ImportFindProperties<MainModel>
    ): CsvMapping<SideModel> | CsvMapping<SideModel>[] {
        if (!this._findFn) {
            throw new Error(`No function to find any models for property ${String(this.idProperty)} is defined`);
        }
        if (!name) {
            return this.getReturnValue();
        }
        if (this.isArray) {
            const names = this.parseName(name);
            const existingModels = names.map(_name => this.find(_name, props));
            return this.getReturnValue(existingModels);
        } else {
            return this.getReturnValue(this.find(name.trim(), props));
        }
    }

    private find(name: string, props: ImportFindProperties<MainModel>): CsvMapping<SideModel> {
        const { importModel } = props;
        const existingModel = this._findFn(name, importModel.model) as any;
        if (existingModel?.id) {
            return {
                name: existingModel.getTitle(),
                id: existingModel.id,
                willBeCreated: false
            } as CsvMapping<SideModel>;
        } else {
            const pseudoModel: CsvMapping<SideModel> = existingModel ?? { name, willBeCreated: false };
            if (
                !this.modelsToCreate.find(model => model.name === pseudoModel.name) &&
                this.shouldCreateModel(pseudoModel, props)
            ) {
                pseudoModel.willBeCreated = true;
                this.modelsToCreate.push(pseudoModel);
            }
            return pseudoModel;
        }
    }

    private createImportProcess(): ImportProcess<SideModel> {
        const models = this.modelsToCreate.map(model => {
            this._additionalFields.forEach(
                field => (model[field.key] = typeof field.value === `function` ? field.value() : field.value)
            );
            return model;
        });
        return new ImportProcess({
            importFn: this._createFn,
            chunkSize: this.chunkSize,
            models: this.doTransformModels(models)
        });
    }

    private async import(): Promise<void> {
        const ids = await this._importProcess.doImport();
        this.modelsToCreate = this.modelsToCreate.map((model, index) => ({
            name: model.name,
            id: ids[index]?.id
        })) as CsvMapping<SideModel>[];
    }

    /**
     * Parses an input by the given name-delimiter if `isArray` is true
     *
     * @param name The input of a single csv entry
     */
    private parseName(name: string): string[] {
        const names = this.filterValidNames(name.split(this._nameDelimiter).map(n => n.trim()));
        if (names.some(n => n.length > 256)) {
            throw new Error(`Name exceeds 256 characters`);
        }
        return names;
    }

    private shouldCreateModel(pseudoModel: CsvMapping<SideModel>, props: ImportFindProperties<MainModel>): boolean {
        const { importModel, allImportModels } = props;
        if (importModel.errors?.length > 0) {
            return false;
        }
        const rawData = allImportModels.map(model => model.model);
        return this._shouldCreateModelFn(pseudoModel, rawData);
    }

    private setFindFn(findFn?: FindFn<SideModel, MainModel>, fallbackRepo?: any): void {
        if (findFn) {
            this._findFn = findFn;
        } else if (fallbackRepo) {
            this._findFn = name =>
                fallbackRepo
                    .getViewModelList()
                    .find((model: any) => model.getTitle() === name || this.translateFn(model.getTitle()) === name);
        }
    }

    private setCreateFn(createFn?: CreateFn<SideModel>, fallbackRepo?: any): void {
        if (createFn) {
            this._createFn = createFn;
        } else if (fallbackRepo) {
            this._createFn = entries => fallbackRepo.create(...entries);
        }
    }

    private getReturnValue(item?: CsvMapping | CsvMapping[]): CsvMapping | CsvMapping[] {
        if (this.isArray) {
            return item ?? [];
        }
        return item || null;
    }

    /**
     * Can be used to filter out empty strings after splitting up an input
     * @returns A string with the valid names
     */
    protected filterValidNames(names: string[]): string[] {
        return names.filter(name => !!name.trim());
    }
}
