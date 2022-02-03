import { Identifiable } from 'app/shared/models/base/identifiable';
import { BehaviorSubject, Observable } from 'rxjs';

import { BaseImportHandler, BaseImportHandlerConfig, ImportHandler } from './base-import-handler';
import { ImportModel } from './import-model';

export interface MainImportHandlerConfig<MainModel> extends BaseImportHandlerConfig {
    /**
     * A function to create models, that are determined as "not duplicates of"
     */
    createFn: (entries: MainModel[]) => Promise<Identifiable[]>;
    /**
     * A function to update models, that already have an id.
     */
    updateFn?: (entries: MainModel[]) => Promise<void>;
    resolveEntryFn?: (importModel: ImportModel<MainModel>) => MainModel;
}

export interface MainImportHandler<MainModel = any> extends ImportHandler {
    getModelsToCreate(): ImportModel<MainModel>[];
    getModelsToCreateObservable(): Observable<ImportModel<MainModel>[]>;
}

export abstract class BaseMainImportHandler<MainModel extends Identifiable>
    extends BaseImportHandler<MainModel>
    implements MainImportHandler<MainModel>
{
    protected set modelsImported(value: ImportModel<MainModel>[]) {
        this._modelsImportedSubject.next(value);
    }

    protected get modelsImported(): ImportModel<MainModel>[] {
        return this._modelsImportedSubject.value;
    }

    protected set modelsToCreate(value: ImportModel<MainModel>[]) {
        this._modelsToCreateSubject.next(value);
    }

    protected get modelsToCreate(): ImportModel<MainModel>[] {
        return this._modelsToCreateSubject.value;
    }

    private _modelsToCreateSubject = new BehaviorSubject<ImportModel<MainModel>[]>([]);
    private _modelsImportedSubject = new BehaviorSubject<ImportModel<MainModel>[]>([]);

    private readonly _createFn: (entries: MainModel[]) => Promise<Identifiable[]>;
    private readonly _updateFn: (entries: MainModel[]) => Promise<void>;
    private readonly _resolveEntryFn: (importModel: ImportModel<MainModel>) => MainModel;

    public constructor(config: MainImportHandlerConfig<MainModel>) {
        super(config);
        this._createFn = config.createFn;
        this._updateFn = config.updateFn;
        this._resolveEntryFn = config.resolveEntryFn ?? (model => model.model);
    }

    public abstract pipeModels(models: ImportModel<MainModel>[]): void | Promise<void>;

    public getModelsToCreate(): ImportModel<MainModel>[] {
        return this.modelsToCreate;
    }

    public getModelsToCreateObservable(): Observable<ImportModel<MainModel>[]> {
        return this._modelsToCreateSubject.asObservable();
    }

    public getModelsToCreateAmount(): number {
        return this.getModelsToCreate().length;
    }

    public getModelsImportedAmount(): number {
        return this.modelsImported.length;
    }

    public doCleanup(): void {
        this.modelsImported = [];
        this.modelsToCreate = [];
    }

    public async doImport(): Promise<void> {
        const results = await this.doCreateModels(this.resolveEntries());
        for (const result of results) {
            const { identifiable, errors } = result;
            const entry = this.modelsToCreate[result.index];
            entry.model.id = identifiable.id;
            entry.errors = entry.errors.concat(errors);
            entry.status = !identifiable.id || errors.length > 0 ? `error` : `done`;
        }
    }

    private resolveEntries(): MainModel[] {
        return this.modelsToCreate.map(model => this._resolveEntryFn(model));
    }

    private async doCreateModels(
        models: MainModel[]
    ): Promise<{ index: number; identifiable: Identifiable; errors: string[] }[]> {
        const M = models.map((model, index) => ({ index, model }));
        const entriesToCreate: { index: number; model: MainModel }[] = M.filter(entry => !entry.model.id);
        const entriesToUpdate: { index: number; model: MainModel }[] = M.filter(entry => !!entry.model.id);
        const identifiables: { identifiable: Identifiable; index: number; errors: string[] }[] = [];
        for (let i = 0; i < Math.ceil(entriesToCreate.length / this.chunkSize); ++i) {
            identifiables.push(
                ...(await this.sendRequest(
                    entriesToCreate.slice(i * this.chunkSize, (i + 1) * this.chunkSize),
                    this._createFn
                ))
            );
        }
        for (let i = 0; i < Math.ceil(entriesToUpdate.length / this.chunkSize); ++i) {
            identifiables.push(
                ...(await this.sendRequest(
                    entriesToUpdate.slice(i * this.chunkSize, (i + 1) * this.chunkSize),
                    this._updateFn
                ))
            );
        }
        return identifiables.sort((dateA, dateB) => dateA.index - dateB.index);
    }

    private async sendRequest(
        models: { model: MainModel; index: number }[],
        fn: (entries: MainModel[]) => Promise<Identifiable[] | void>
    ): Promise<{ index: number; identifiable: Identifiable; errors: string[] }[]> {
        const request = async (data: { model: MainModel; index: number }[]) => {
            const defaultIdentifiables = data.map(date => ({ id: date.model.id }));
            const returnValue = (await fn(data.map(date => date.model))) || defaultIdentifiables;
            this.modelsImported = this.modelsImported.concat(data as any);
            return returnValue.map((date, index) => ({
                index: data[index].index,
                identifiable: date || { id: data[index].model.id }
            }));
        };
        const sendSingleRequest = async (date: { model: MainModel; index: number }) => {
            let response: { identifiable: Identifiable; errors: string[]; index: number }[] = [];
            try {
                response = (await request([date])).map(receivedValue => ({ errors: [], ...receivedValue }));
            } catch (e) {
                response = [{ identifiable: { id: date.model.id }, errors: [e], index: date.index }];
            }
            return response;
        };
        const result: { identifiable: Identifiable; errors: string[]; index: number }[] = [];
        try {
            result.push(...(await request(models)).map(date => ({ errors: [], ...date })));
        } catch (e) {
            for (const model of models) {
                result.push(...(await sendSingleRequest(model)));
            }
        }
        return result;
    }
}
