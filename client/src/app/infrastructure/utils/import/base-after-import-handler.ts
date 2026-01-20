import { BaseSideImportHandler, BaseSideImportHandlerConfig, SideImportHandler } from './base-side-import-handler';

const AFTER_IMPORT_HANDLER_NAME = `AfterImportHandler`;

export function isAfterImportHandler(instance: any): instance is AfterImportHandler {
    return instance?.name === AFTER_IMPORT_HANDLER_NAME;
}

export interface AfterImportHandler<ToCreate = any, ToImport = any> extends SideImportHandler<ToCreate, ToImport> {
    readonly name: typeof AFTER_IMPORT_HANDLER_NAME;
}

export abstract class BaseAfterImportHandler<ToCreate = any, ToImport = any>
    extends BaseSideImportHandler<ToCreate, ToImport>
    implements AfterImportHandler<ToCreate, ToImport>
{
    public readonly name = AFTER_IMPORT_HANDLER_NAME;

    public constructor(config: BaseSideImportHandlerConfig<ToCreate, ToImport>) {
        super(config);
    }
}
