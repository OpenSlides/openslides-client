import {
    CsvMapping,
    ImportCleanup,
    ImportFind,
    ImportResolveHandler,
    ImportStep,
    ImportStepPhase
} from 'app/core/ui-services/base-import.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BehaviorSubject, Observable } from 'rxjs';

import { ImportHandlerConfig } from './import-handler-config';

type CreateFn<E> = (entries: E[]) => Promise<Identifiable[]>;
type FindFn<E, O> = (name: string, originalEntry: O, index: number) => E;

export interface ImportHandler<ToCreate, ToImport = any>
    extends ImportStep,
        ImportFind<ToImport>,
        ImportResolveHandler<ToCreate>,
        ImportCleanup {}

export interface BaseImportHandlerConfig<ToCreate = any, ToImport = any>
    extends ImportHandlerConfig<ToCreate, ToImport> {
    idProperty: keyof ToCreate;
    translateFn?: (value: string) => string;
}

export abstract class BaseImportHandler<ToCreate, ToImport> implements ImportHandler<ToCreate, ToImport> {
    protected set modelsToCreate(next: CsvMapping[]) {
        this._modelsToCreateSubject.next(next);
    }

    protected get modelsToCreate(): CsvMapping[] {
        return this._modelsToCreateSubject.value;
    }

    public get modelsToCreateObservable(): Observable<CsvMapping<ToImport>[]> {
        return this._modelsToCreateSubject.asObservable();
    }

    public get phase(): ImportStepPhase {
        return this._importingStepPhaseSubject.value;
    }

    public get phaseObservable(): Observable<ImportStepPhase> {
        return this._importingStepPhaseSubject.asObservable();
    }

    protected get isArray(): boolean {
        return this._isArrayProperty || this._useArray;
    }

    protected get chunkSize(): number {
        return this._fixedChunkSize ?? this._chunkSize;
    }

    protected readonly translateFn: (value: string) => string;
    protected readonly verboseNameFn: ((plural?: boolean) => string) | string;
    protected readonly idProperty: keyof ToCreate;

    private readonly _modelsToCreateSubject = new BehaviorSubject<CsvMapping<ToImport>[]>([]);
    private readonly _modelsImportedSubject = new BehaviorSubject<CsvMapping<ToImport>[]>([]);
    private readonly _importingStepPhaseSubject = new BehaviorSubject<ImportStepPhase>(ImportStepPhase.ENQUEUED);

    private _transformFn: (entries: CsvMapping<ToImport>[], originalEntries: ToCreate[]) => CsvMapping[];
    private _createFn: (entries: CsvMapping<ToImport>[]) => Promise<Identifiable[]>;
    private _findFn: (name: string, originalEntry: ToCreate, index: number) => ToImport | CsvMapping<ToImport>;
    private _additionalFields: { key: keyof ToImport; value: unknown | (() => unknown) }[];
    private _nameDelimiter: string;
    private _useArray: boolean;
    private readonly _fixedChunkSize: number;

    private _chunkSize = 100;
    private _isArrayProperty = false;

    public constructor({
        idProperty,
        translateFn,
        useArray = false,
        repo,
        verboseNameFn,
        additionalFields = [],
        nameDelimiter = `,`,
        fixedChunkSize,
        transformFn = models => models,
        createFn,
        findFn
    }: BaseImportHandlerConfig<ToCreate, ToImport>) {
        this.idProperty = idProperty;
        this.translateFn = translateFn;
        this.verboseNameFn = verboseNameFn ?? repo?.getVerboseName;
        this._useArray = useArray;
        this._additionalFields = additionalFields;
        this._nameDelimiter = nameDelimiter;
        this._fixedChunkSize = fixedChunkSize;
        this._transformFn = transformFn;

        this.setCreateFn(createFn, repo);
        this.setFindFn(findFn, repo);

        if ((idProperty as string).slice(-3) === `ids`) {
            this._isArrayProperty = true;
        }
    }

    public doCleanup(): void {
        this.modelsToCreate = [];
        this._modelsImportedSubject.next([]);
        this.nextStep(ImportStepPhase.ENQUEUED);
    }

    public async doImport(originalEntries: ToCreate[]): Promise<void> {
        if (!this._createFn) {
            throw new Error(`No function to create models is defined`);
        }
        this.nextStep(ImportStepPhase.PENDING);
        if (this.modelsToCreate.length) {
            await this.import(originalEntries);
        }
        this.nextStep(ImportStepPhase.FINISHED);
    }

    public setChunkSize(size: number): void {
        if (size) {
            this._chunkSize = size;
        }
    }

    public getModelsImported(): CsvMapping<ToImport>[] {
        return this._modelsImportedSubject.value;
    }

    public getModelsToCreate(): CsvMapping<ToImport>[] {
        return this.modelsToCreate;
    }

    public getVerboseName(): string {
        if (!this.verboseNameFn) {
            throw new Error(`No verbose name is defined`);
        }
        if (typeof this.verboseNameFn === `string`) {
            return this.verboseNameFn;
        }
        return this.verboseNameFn(this.modelsToCreate.length > 1);
    }

    public nextStep(step: ImportStepPhase): void {
        this._importingStepPhaseSubject.next(step);
    }

    public findByName(name: string, csvLine: CsvMapping, index: number): CsvMapping<ToImport> | CsvMapping<ToImport>[] {
        if (!this._findFn) {
            throw new Error(`No function to find any models is defined`);
        }
        if (!name) {
            return this.getReturnValue();
        }
        if (this.isArray) {
            const names = name
                .split(this._nameDelimiter)
                .map(n => n.trim())
                .filter(n => !!n);
            const existingModels = names.map(n => this.find(n, csvLine, index));
            return this.getReturnValue(existingModels);
        } else {
            return this.getReturnValue(this.find(name.trim(), csvLine, index));
        }
    }

    protected doTransformModels(models: CsvMapping[], _originalEntries: ToCreate[]): CsvMapping[] {
        return this._transformFn(models, _originalEntries);
    }

    protected onAfterCreateUnresolvedEntries(_modelsImported: ToImport[], _originalEntries: ToCreate[]): void {}

    private find(name: string, csvLine: CsvMapping, index: number): CsvMapping<ToImport> {
        const existingModel = (this._findFn(name, csvLine, index) ||
            this._findFn(this.translateFn(name), csvLine, index)) as any;
        if (existingModel?.id) {
            return { name: existingModel.getTitle(), id: existingModel.id } as CsvMapping<ToImport>;
        } else {
            const pseudoModel: CsvMapping<ToImport> = existingModel ?? ({ name } as CsvMapping<ToImport>);
            if (!this.modelsToCreate.find(model => model.name === pseudoModel.name)) {
                this.modelsToCreate.push(pseudoModel);
            }
            return pseudoModel;
        }
    }

    private async import(originalEntries: ToCreate[]): Promise<void> {
        const models = this.modelsToCreate.map(model => {
            this._additionalFields.forEach(
                field => (model[field.key] = typeof field.value === `function` ? field.value() : field.value)
            );
            return model;
        });
        const ids = await this.importHelper(this.doTransformModels(models, originalEntries));
        this.modelsToCreate = this.modelsToCreate.map((model, index) => ({
            name: model.name,
            id: ids[index]?.id
        })) as CsvMapping<ToImport>[];
        this.onAfterCreateUnresolvedEntries(this.modelsToCreate, originalEntries);
    }

    private async importHelper(models: CsvMapping[]): Promise<Identifiable[]> {
        const identifiables: Identifiable[] = [];
        let sliceIndex = 0;
        do {
            const chunkModels =
                this.chunkSize === 0
                    ? models
                    : models.slice(sliceIndex * this.chunkSize, (sliceIndex + 1) * this.chunkSize);
            const ids = await this.create(chunkModels);
            identifiables.push(...ids);
            const previousValue = this._modelsImportedSubject.value;
            this._modelsImportedSubject.next(previousValue.concat(chunkModels.filter((_, index) => !!ids[index].id)));
            sliceIndex += 1;
        } while (sliceIndex < Math.ceil(models.length / this.chunkSize));
        return identifiables;
    }

    private async create(models: CsvMapping<ToImport>[]): Promise<Identifiable[]> {
        try {
            return await this._createFn(models);
        } catch (e) {
            const identifiables: Identifiable[] = [];
            for (const model of models) {
                try {
                    identifiables.push(...(await this._createFn([model])));
                } catch (_) {
                    identifiables.push({ id: null });
                }
            }
            return identifiables;
        }
    }

    private setFindFn(findFn?: FindFn<ToImport, ToCreate>, fallbackRepo?: any): void {
        if (findFn) {
            this._findFn = findFn;
        } else if (fallbackRepo) {
            this._findFn = name => fallbackRepo.getViewModelList().find(model => model.getTitle() === name);
        }
    }

    private setCreateFn(createFn?: CreateFn<ToImport>, fallbackRepo?: any): void {
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
}
