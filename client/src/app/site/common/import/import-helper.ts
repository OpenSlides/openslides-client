import { CsvMapping } from 'app/core/ui-services/base-import.service';
import { BaseModel } from 'app/shared/models/base/base-model';

export interface ImportResolveInformation<M extends BaseModel> {
    model: M;
    unresolvedModels: number;
    verboseName?: string;
}

export interface ImportHelper<M extends BaseModel> {
    findByName(name: string): CsvMapping | CsvMapping[];
    createUnresolvedEntries(): Promise<void>;
    linkToItem(item: M, propertyName: string): ImportResolveInformation<M>;
}
