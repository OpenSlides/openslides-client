import { BehaviorSubject } from 'rxjs';

import { VoidFn } from '../functions';
import { CsvMapping, ImportIdentifiable } from './import-utils';

interface ImportResult extends ImportIdentifiable {
    importError?: any;
}

export interface ImportProcessConfig<ModelsToCreate> {
    importFn: (models: CsvMapping<ModelsToCreate>[]) => Promise<ImportIdentifiable[] | void>;
    chunkSize: number;
    models: CsvMapping<ModelsToCreate>[];

    afterImportChunkFn?: (modelsChunk: CsvMapping<ModelsToCreate>[], result: ImportResult[]) => void;
}

export class ImportProcess<ModelsToCreate> {
    public get modelsImportedAmount(): number {
        return this._modelsImportedSubject.value.length;
    }

    private readonly _modelsImportedSubject = new BehaviorSubject<CsvMapping<ModelsToCreate>[]>([]);

    private readonly _importFn: (models: CsvMapping<ModelsToCreate>[]) => Promise<ImportIdentifiable[] | void>;
    private readonly _chunkSize: number;
    private readonly _models: CsvMapping<ModelsToCreate>[];
    private readonly _afterImportChunkFn: (modelsChunk: CsvMapping<ModelsToCreate>[], result: ImportResult[]) => void;

    private _importFailCounter = 0;

    public constructor(config: ImportProcessConfig<ModelsToCreate>) {
        this._afterImportChunkFn = config.afterImportChunkFn ?? VoidFn;
        this._importFn = config.importFn;
        this._chunkSize = config.chunkSize;
        this._models = config.models;
    }

    public async doImport(models: CsvMapping<ModelsToCreate>[] = this._models): Promise<ImportIdentifiable[]> {
        const identifiables: ImportResult[] = [];
        let sliceIndex = 0;
        while (sliceIndex < Math.ceil(models.length / this._chunkSize)) {
            const modelsChunk =
                this._chunkSize === 0
                    ? models
                    : models.slice(sliceIndex * this._chunkSize, (sliceIndex + 1) * this._chunkSize);
            const nextImportResult = await this.doCreateModels(modelsChunk);
            identifiables.push(...nextImportResult);
            const previousValue = this._modelsImportedSubject.value;
            this._modelsImportedSubject.next(
                previousValue.concat(modelsChunk.filter((_, index) => !nextImportResult[index]?.importError))
            );
            this._afterImportChunkFn(modelsChunk, nextImportResult);
            sliceIndex += 1;
        }
        return identifiables;
    }

    public cleanUp(): void {
        this._modelsImportedSubject.next([]);
    }

    private async doCreateModels(models: CsvMapping<ModelsToCreate>[]): Promise<ImportResult[]> {
        try {
            return this.getArray(await this.doCreateModelsHelper(models));
        } catch (e) {
            const identifiables: ImportResult[] = [];
            for (const model of models) {
                identifiables.push(...(await this.handleCreateError(model)));
            }
            return identifiables;
        }
    }

    private async doCreateModelsHelper(models: CsvMapping<ModelsToCreate>[]): Promise<ImportIdentifiable[] | void> {
        if (this._importFailCounter >= 3) {
            return models.map(() => ({ id: null }));
        } else {
            return await this._importFn(models);
        }
    }

    private async handleCreateError(model: CsvMapping<ModelsToCreate>): Promise<ImportResult[]> {
        try {
            return this.getArray(await this.doCreateModelsHelper([model]));
        } catch (e) {
            ++this._importFailCounter;
            return [{ id: null, importError: e }];
        }
    }

    private getArray(result: ImportIdentifiable[] | void): ImportIdentifiable[] {
        if (Array.isArray(result)) {
            return result.filter(value => !!value);
        } else {
            return [];
        }
    }
}
