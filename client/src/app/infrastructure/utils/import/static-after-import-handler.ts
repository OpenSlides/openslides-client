import { BaseAfterImportHandler } from './base-after-import-handler';
import { SideImportHandlerConfig } from './side-import-handler-config';

export interface StaticAfterImportConfig<ToCreate, ToImport = any>
    extends SideImportHandlerConfig<ToCreate, ToImport> {}

export class StaticAfterImportHandler<ToCreate = any, ToImport = any> extends BaseAfterImportHandler<
    ToCreate,
    ToImport
> {
    public constructor(
        readonly config: StaticAfterImportConfig<ToCreate, ToImport>,
        override readonly idProperty: keyof ToCreate,
        override readonly translateFn: (value: string) => string
    ) {
        super({ idProperty, ...config, translateFn });
    }
}
