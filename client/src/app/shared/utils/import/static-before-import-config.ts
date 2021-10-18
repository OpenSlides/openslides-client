import { ImportHandlerConfig } from './import-handler-config';

export interface StaticBeforeImportConfig<ToCreate = any, ToImport = any>
    extends ImportHandlerConfig<ToCreate, ToImport> {
    /**
     * The property of the models, which are created, models created by this helper are linked to
     */
    idProperty: keyof ToCreate;
    /**
     * A function that will be called immediately after the function `createUnresolvedEntries` has been executed
     */
    afterCreateUnresolvedEntriesFn?: (modelsImported: ToImport[], originalEntries: ToCreate[]) => void;
}
