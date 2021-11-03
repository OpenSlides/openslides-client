import { ImportResolveInformation } from 'app/shared/utils/import/import-resolve-information';

import { BaseImportHandler, BaseImportHandlerConfig, ImportHandler } from './base-import-handler';

export interface BeforeImportHandler<ToCreate = any, ToImport = any> extends ImportHandler<ToCreate, ToImport> {
    doResolve(item: ToCreate, propertyName: string): ImportResolveInformation<ToCreate>;
}

export abstract class BaseBeforeImportHandler<ToCreate = any, ToImport = any>
    extends BaseImportHandler<ToCreate, ToImport>
    implements BeforeImportHandler<ToCreate, ToImport>
{
    public readonly name = `BeforeImportHandler`;

    public constructor(config: BaseImportHandlerConfig<ToCreate, ToImport>) {
        super(config);
    }

    public abstract doResolve(item: ToCreate, propertyName: string): ImportResolveInformation<ToCreate>;
}
