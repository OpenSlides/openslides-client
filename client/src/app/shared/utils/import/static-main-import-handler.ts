import { Identifiable } from '../../models/base/identifiable';
import { BaseMainImportHandler } from './base-main-import-handler';
import { MainImportHandlerConfig } from './base-main-import-handler';
import { ImportModel } from './import-model';

export interface StaticMainImportConfig<ToCreate> extends MainImportHandlerConfig<ToCreate> {
    shouldBeCreatedFn?: (model: ImportModel<ToCreate>) => boolean;
    /**
     * This function can be omitted, if the function `onCreateImportModel` is overriden
     */
    getDuplicatesFn?: (newEntry: Partial<ToCreate>) => any[] | Promise<any[]>;
}

/**
 * This class handles the import of the main "importing" models.
 */
export class StaticMainImportHandler<ToCreate extends Identifiable> extends BaseMainImportHandler<ToCreate> {
    private readonly _shouldBeCreatedFn: (model: ImportModel<ToCreate>) => boolean;

    public constructor(config: StaticMainImportConfig<ToCreate>) {
        super(config);
        this._shouldBeCreatedFn = config.shouldBeCreatedFn ?? (model => !model.hasDuplicates);
    }

    public pipeModels(models: ImportModel<ToCreate>[]): void | Promise<void> {
        this.modelsToCreate = models.filter(this._shouldBeCreatedFn);
    }
}
