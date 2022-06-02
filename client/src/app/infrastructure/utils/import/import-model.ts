import { Identifiable } from 'src/app/domain/interfaces';

import { CsvImportStatus } from './import-utils';

export type ImportModelConfig<ToCreate> = Partial<ImportModel<ToCreate>> & {
    model: ToCreate;
    importTrackId: number;
    afterImportFields?: { [field: string]: any };
};

export function createImportModel<ToCreate>(config: ImportModelConfig<ToCreate>): ImportModel<ToCreate> {
    return new ImportModel(config);
}

export class ImportModel<ToCreate> implements Identifiable {
    public readonly id: number;

    /**
     * @deprecated: The `id` property is used as same value
     */
    public readonly importTrackId: number;
    public readonly afterImportFields: { [field: string]: any };

    public set newEntry(model: ToCreate) {
        this.model = model;
    }

    public get newEntry(): ToCreate {
        return this.model;
    }

    public model: ToCreate;
    public errors: string[];
    public status: CsvImportStatus;
    public duplicates: Partial<ToCreate>[];
    public hasDuplicates: boolean;

    public constructor({ model, importTrackId, afterImportFields, ...config }: ImportModelConfig<ToCreate>) {
        this.model = model;
        this.id = importTrackId;
        this.importTrackId = importTrackId;
        this.afterImportFields = afterImportFields || [];
        this.errors = config.errors || [];
        this.hasDuplicates =
            typeof config.hasDuplicates === `boolean` ? config.hasDuplicates : !!config.duplicates?.length;
        this.duplicates = config.duplicates || [];
        this.status = config.status || `new`;
    }
}
