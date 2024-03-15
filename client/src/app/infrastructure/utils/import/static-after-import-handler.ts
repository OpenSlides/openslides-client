import { BaseAfterImportHandler } from './base-after-import-handler';
import { SideImportHandlerConfig } from './side-import-handler-config';

export interface StaticAfterImportConfig<ToCreate, ToImport = any>
    extends SideImportHandlerConfig<ToCreate, ToImport> {}

export class StaticAfterImportHandler<ToCreate = any, ToImport = any> extends BaseAfterImportHandler<
    ToCreate,
    ToImport
> {
    public constructor(
        config: StaticAfterImportConfig<ToCreate, ToImport>,
        idProperty: keyof ToCreate,
        translateFn: (value: string) => string
    ) {
        super({ idProperty, ...config, translateFn });
    }
}
