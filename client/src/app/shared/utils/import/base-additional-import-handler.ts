import { CsvMapping } from 'app/core/ui-services/base-import.service';

import { BaseImportHandler, ImportHandler } from './base-import-handler';

export interface AdditionalImportHandler<MainModel = any, SideModel = any> extends ImportHandler<MainModel> {
    /**
     * Each additional import handler is a sub import handler to a specific main import handler.
     * Therefore, it will act depending on the imported models of the main import handler. This function
     * takes the imported models as argument.
     */
    pipeImportedSideModels: (models: CsvMapping<SideModel>[]) => void;
}

export abstract class BaseAdditionalImportHandler<MainModel, SideModel>
    extends BaseImportHandler<MainModel, SideModel>
    implements AdditionalImportHandler<MainModel, SideModel>
{
    public pipeImportedSideModels(models: CsvMapping<SideModel>[]): void {}
}
