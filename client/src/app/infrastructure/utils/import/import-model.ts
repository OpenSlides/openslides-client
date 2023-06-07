import { Identifiable } from 'src/app/domain/interfaces';

import { CsvImportStatus } from './import-utils';

export class ImportModel<ToCreate> implements Identifiable {
    public readonly id: number;

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

    public constructor({ model, id, ...config }: Partial<ImportModel<ToCreate>>) {
        this.model = model as ToCreate;
        this.id = id;
        this.afterImportFields = config.afterImportFields || [];
        this.errors = config.errors || [];
        this.hasDuplicates =
            typeof config.hasDuplicates === `boolean` ? config.hasDuplicates : !!config.duplicates?.length;
        this.duplicates = config.duplicates || [];
        this.status = config.status || `new`;
    }
}
