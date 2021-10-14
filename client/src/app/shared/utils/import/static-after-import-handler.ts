import { BaseAfterImportHandler } from './base-after-import-handler';
import { ImportHandlerConfig } from './import-handler-config';

export interface StaticAfterImportConfig<ToCreate, ToImport = any> extends ImportHandlerConfig<ToCreate, ToImport> {}

export class StaticAfterImportHandler<ToCreate = any, ToImport = any> extends BaseAfterImportHandler<
    ToCreate,
    ToImport
> {
    public constructor(config: StaticAfterImportConfig<ToCreate, ToImport>, idProperty: keyof ToCreate) {
        super({ idProperty, ...config });
    }
}
