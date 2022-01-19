import { Identifiable } from 'app/shared/models/base/identifiable';
import { BehaviorSubject, Observable } from 'rxjs';

import { ImportCleanup, ImportStep, ImportStepPhase } from '../../../core/ui-services/base-import.service';
import { ImportModel } from './import-model';
import { ImportStepDescriptor } from './import-step-descriptor';

export interface MainImportHandlerConfig<ToCreate> {
    createFn: (entries: ToCreate[]) => Promise<Identifiable[]>;
    updateFn?: (entries: ToCreate[]) => Promise<void>;
    resolveEntryFn?: (importModel: ImportModel<ToCreate>) => ToCreate;
    verboseNameFn?: string | ((plural?: boolean) => string);
    labelFn?: string | ((phase: ImportStepPhase, plural?: boolean) => string);
    chunkSize?: number;
}

export interface MainImportHandler<ToCreate = any> extends ImportStep, ImportCleanup {
    pipeModels(models: ImportModel<ToCreate>[]): void | Promise<void>;
    getModelsToCreate(): ImportModel<ToCreate>[];
    getModelsToCreateObservable(): Observable<ImportModel<ToCreate>[]>;
    doImport(): Promise<void>;
}

export abstract class BaseMainImportHandler<ToCreate extends Identifiable> implements MainImportHandler<ToCreate> {
    public phase: ImportStepPhase = ImportStepPhase.ENQUEUED;

    protected set modelsImported(value: ImportModel<ToCreate>[]) {
        this._modelsImportedSubject.next(value);
    }

    protected get modelsImported(): ImportModel<ToCreate>[] {
        return this._modelsImportedSubject.value;
    }

    protected set modelsToCreate(value: ImportModel<ToCreate>[]) {
        this._modelsToCreateSubject.next(value);
    }

    protected get modelsToCreate(): ImportModel<ToCreate>[] {
        return this._modelsToCreateSubject.value;
    }

    private _modelsToCreateSubject = new BehaviorSubject<ImportModel<ToCreate>[]>([]);
    private _modelsImportedSubject = new BehaviorSubject<ImportModel<ToCreate>[]>([]);
    private _importStepDescriptor: ImportStepDescriptor;

    private readonly _createFn: (entries: ToCreate[]) => Promise<Identifiable[]>;
    private readonly _updateFn: (entries: ToCreate[]) => Promise<void>;
    private readonly _resolveEntryFn: (importModel: ImportModel<ToCreate>) => ToCreate;
    private readonly _chunkSize: number;

    public constructor(config: MainImportHandlerConfig<ToCreate>) {
        this._chunkSize = config.chunkSize ?? 100;
        this._createFn = config.createFn;
        this._updateFn = config.updateFn;
        this._resolveEntryFn = config.resolveEntryFn ?? (model => model.model);
        this._importStepDescriptor = new ImportStepDescriptor({
            verboseNameFn: config.verboseNameFn,
            labelFn: config.labelFn
        });
    }

    public abstract pipeModels(models: ImportModel<ToCreate>[]): void | Promise<void>;

    public getModelsToCreate(): ImportModel<ToCreate>[] {
        return this.modelsToCreate;
    }

    public getModelsToCreateObservable(): Observable<ImportModel<ToCreate>[]> {
        return this._modelsToCreateSubject.asObservable();
    }

    public getDescription(): string {
        return this._importStepDescriptor.getDescription(this.phase, this.getModelsToCreate().length !== 1);
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

    private resolveEntries(): ToCreate[] {
        return this.modelsToCreate.map(model => this._resolveEntryFn(model));
    }

    private async doCreateModels(
        models: ToCreate[]
    ): Promise<{ index: number; identifiable: Identifiable; errors: string[] }[]> {
        const M = models.map((model, index) => ({ index, model }));
        const entriesToCreate: { index: number; model: ToCreate }[] = M.filter(entry => !entry.model.id);
        const entriesToUpdate: { index: number; model: ToCreate }[] = M.filter(entry => !!entry.model.id);
        const identifiables: { identifiable: Identifiable; index: number; errors: string[] }[] = [];
        for (let i = 0; i < Math.ceil(entriesToCreate.length / this._chunkSize); ++i) {
            identifiables.push(
                ...(await this.sendRequest(
                    entriesToCreate.slice(i * this._chunkSize, (i + 1) * this._chunkSize),
                    this._createFn
                ))
            );
        }
        for (let i = 0; i < Math.ceil(entriesToUpdate.length / this._chunkSize); ++i) {
            identifiables.push(
                ...(await this.sendRequest(
                    entriesToUpdate.slice(i * this._chunkSize, (i + 1) * this._chunkSize),
                    this._updateFn
                ))
            );
        }
        return identifiables.sort((dateA, dateB) => dateA.index - dateB.index);
    }

    private async sendRequest(
        models: { model: ToCreate; index: number }[],
        fn: (entries: ToCreate[]) => Promise<Identifiable[] | void>
    ): Promise<{ index: number; identifiable: Identifiable; errors: string[] }[]> {
        const request = async (data: { model: ToCreate; index: number }[]) => {
            const defaultIdentifiables = data.map(date => ({ id: date.model.id }));
            const returnValue = (await fn(data.map(date => date.model))) || defaultIdentifiables;
            this.modelsImported = this.modelsImported.concat(data as any);
            return returnValue.map((date, index) => ({
                index: data[index].index,
                identifiable: date || { id: data[index].model.id }
            }));
        };
        const sendSingleRequest = async (date: { model: ToCreate; index: number }) => {
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
