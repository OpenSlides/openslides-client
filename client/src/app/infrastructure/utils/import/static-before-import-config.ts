import { SideImportHandlerConfig } from './side-import-handler-config';

export interface StaticBeforeImportConfig<ToCreate = any, ToImport = any>
    extends SideImportHandlerConfig<ToCreate, ToImport> {
    /**
     * The property of the models, which are created, models created by this helper are linked to
     */
    idProperty: keyof ToCreate;
}
