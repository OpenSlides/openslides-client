import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ImportModel } from 'src/app/infrastructure/utils/import/import-model';
import { ImportStep } from 'src/app/infrastructure/utils/import/import-step';
import { ValueLabelCombination } from 'src/app/infrastructure/utils/import/import-utils';

interface ImportServicePreview {
    new: number;
    done: number;
    duplicates: number;
    errors: number;
    total: number;
}

export interface ImportService<M extends Identifiable> {
    readonly rawFileObservable: Observable<File | null>;
    readonly encodings: ValueLabelCombination[];
    readonly columnSeparators: ValueLabelCombination[];
    readonly textSeparators: ValueLabelCombination[];
    readonly summary: ImportServicePreview;
    readonly importingStepsObservable: Observable<ImportStep[]>;
    readonly leftReceivedHeaders: string[];
    readonly leftExpectedHeaders: { [key: string]: string };
    readonly headerValues: { [key: string]: string };

    columnSeparator: string;
    textSeparator: string;
    encoding: string;

    verbose(error: string): string;
    hasError(row: ImportModel<M>, error: string): boolean;
    refreshFile(): void;
    clearPreview(): void;
    clearFile(): void;
    getNewEntriesObservable(): Observable<ImportModel<M>[]>;
    onSelectFile(event: any): void;
    doImport(): Promise<void>;
    setNewHeaderValue(headerDefinition: { [headerKey: string]: string }): void;
    downloadCsvExample(): void;
}
