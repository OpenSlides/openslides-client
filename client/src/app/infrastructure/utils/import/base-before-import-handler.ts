import { BaseSideImportHandler, BaseSideImportHandlerConfig, SideImportHandler } from './base-side-import-handler';
import { ImportResolveInformation } from './import-utils';

const BEFORE_IMPORT_HANDLER_NAME = `BeforeImportHandler`;

export function isBeforeImportHandler(instance: any): instance is BeforeImportHandler {
    return instance?.name === BEFORE_IMPORT_HANDLER_NAME;
}

export interface BeforeImportHandler<ToCreate = any, ToImport = any> extends SideImportHandler<ToCreate, ToImport> {
    readonly name: typeof BEFORE_IMPORT_HANDLER_NAME;
    doResolve(item: ToCreate, propertyName: string): ImportResolveInformation<ToCreate>;
}

export abstract class BaseBeforeImportHandler<ToCreate = any, ToImport = any>
    extends BaseSideImportHandler<ToCreate, ToImport>
    implements BeforeImportHandler<ToCreate, ToImport>
{
    public readonly name = BEFORE_IMPORT_HANDLER_NAME;

    public constructor(config: BaseSideImportHandlerConfig<ToCreate, ToImport>) {
        super(config);
    }

    public abstract doResolve(item: ToCreate, propertyName: string): ImportResolveInformation<ToCreate>;
}
