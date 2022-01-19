import { CsvImportStatus } from '../../../core/ui-services/base-import.service';

export class ImportModel<ToCreate> {
    public readonly importTrackId: number;

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

    public constructor({
        model,
        importTrackId,
        ...config
    }: { model: ToCreate; importTrackId: number } & Partial<ImportModel<ToCreate>>) {
        this.model = model;
        this.importTrackId = importTrackId;
        this.errors = config.errors || [];
        this.hasDuplicates =
            typeof config.hasDuplicates === `boolean` ? config.hasDuplicates : !!config.duplicates?.length;
        this.duplicates = config.duplicates || [];
        this.status = config.status || `new`;
    }
}
