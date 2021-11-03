import { BaseImportHandler, BaseImportHandlerConfig, ImportHandler } from './base-import-handler';

export interface AfterImportHandler<ToCreate = any, ToImport = any> extends ImportHandler<ToCreate, ToImport> {}

export abstract class BaseAfterImportHandler<ToCreate = any, ToImport = any>
    extends BaseImportHandler<ToCreate, ToImport>
    implements AfterImportHandler<ToCreate, ToImport>
{
    public readonly name = `AfterImportHandler`;

    public constructor(config: BaseImportHandlerConfig<ToCreate, ToImport>) {
        super(config);
    }
}
