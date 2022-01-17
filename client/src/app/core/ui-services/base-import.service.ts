import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseBeforeImportHandler, BeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { BaseMainImportHandler, MainImportHandler } from 'app/shared/utils/import/base-main-import-handler';
import { ImportModel } from 'app/shared/utils/import/import-model';
import { Papa, ParseConfig } from 'ngx-papaparse';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Identifiable } from '../../shared/models/base/identifiable';
import { AfterImportHandler, BaseAfterImportHandler } from '../../shared/utils/import/base-after-import-handler';
import {
    StaticAfterImportConfig,
    StaticAfterImportHandler
} from '../../shared/utils/import/static-after-import-handler';
import { StaticBeforeImportConfig } from '../../shared/utils/import/static-before-import-config';
import { StaticBeforeImportHandler } from '../../shared/utils/import/static-before-import-handler';
import { StaticMainImportConfig, StaticMainImportHandler } from '../../shared/utils/import/static-main-import-handler';
import { Id } from '../definitions/key-types';
import { ImportServiceCollector } from './import-service-collector';

/**
 * Interface for value- Label combinations.
 */
export interface ValueLabelCombination {
    value: string;
    label: string;
}

interface FileReaderProgressEvent extends ProgressEvent {
    readonly target: FileReader | null;
}

/**
 * interface for a preview summary
 */
export interface ImportCSVPreview {
    total: number;
    duplicates: number;
    errors: number;
    new: number;
    done: number;
}

/**
 * Interface for correlating between strings representing BaseModels and existing
 * BaseModels.
 */
export type CsvMapping<T = any> = T & {
    name: string;
    id?: Id;
    multiId?: Id[];
};

/**
 * The permitted states of a new entry. Only a 'new' entry should be imported
 * and then be set to 'done'.
 */
export type CsvImportStatus = 'new' | 'error' | 'done' | string;

export interface CsvJsonMapping {
    [key: string]: string;
}

export type ImportConfig<ToCreate = any, K = any> = StaticMainImportConfig<ToCreate> & {
    modelHeadersAndVerboseNames: K;
    requiredFields?: (keyof ToCreate)[];
};

export enum ImportStepPhase {
    ENQUEUED,
    PENDING,
    FINISHED,
    ERROR
}

export interface ImportStep {
    phase: ImportStepPhase;
    getModelsToCreateAmount(): number;
    getModelsImportedAmount(): number;
    getDescription(): string;
}

export interface ImportFind<ToImport> {
    findByName: (name: string, line: any) => CsvMapping<ToImport> | CsvMapping<ToImport>[];
}

export interface ImportResolveHandler<ToCreate, ReturnType = void> {
    doImport: (originalEntries: ToCreate[]) => ReturnType | Promise<ReturnType>;
}

export interface ImportCleanup {
    doCleanup: () => void;
}

const DUPLICATE_IMPORT_ERROR = `Duplicates`;

/**
 * Abstract service for imports
 */
@Injectable({
    providedIn: `root`
})
export abstract class BaseImportService<ToCreate extends Identifiable> {
    public chunkSize = 100;

    /**
     * List of possible errors and their verbose explanation
     */
    public errorList: { [errorKey: string]: string } = {};

    /**
     * The headers expected in the CSV matching import properties (in order)
     */
    public expectedHeaders: string[];

    /**
     * The minimimal number of header entries needed to successfully create an entry
     */
    public requiredHeaderLength = 2;

    /**
     * The used column separator. If left on an empty string (default),
     * the papaparse parser will automatically decide on separators.
     */
    public columnSeparator = ``;

    /**
     * The used text separator.
     */
    public textSeparator = `"`;

    /**
     * The encoding used by the FileReader object.
     */
    public encoding = `utf-8`;

    public get currentImportPhaseObservable(): Observable<ImportStepPhase> {
        return this._currentImportPhaseSubject.asObservable();
    }

    public get isImportValidObservable(): Observable<boolean> {
        return this._isImportValidSubject.asObservable();
    }

    /**
     * List of possible encodings and their label. values should be values accepted
     * by the FileReader API
     */
    public encodings: ValueLabelCombination[] = [
        { value: `utf-8`, label: `UTF 8 - Unicode` },
        { value: `iso-8859-1`, label: `ISO 8859-1 - West European` },
        { value: `iso-8859-15`, label: `ISO 8859-15 - West European (with €)` }
    ];

    /**
     * List of possible column separators to pass on to papaParse
     */
    public columnSeparators: ValueLabelCombination[] = [
        { label: `Comma`, value: `,` },
        { label: `Semicolon`, value: `;` },
        { label: `Automatic`, value: `` }
    ];

    /**
     * List of possible text separators to pass on to papaParse. Note that
     * it cannot automatically detect textseparators (value must not be an empty string)
     */
    public textSeparators: ValueLabelCombination[] = [
        { label: `Double quotes (")`, value: `"` },
        { label: `Single quotes (')`, value: `'` },
        { label: `Gravis (\`)`, value: `\`` }
    ];

    /**
     * Emits an error string to display if a file import cannot be done
     */
    public errorEvent = new EventEmitter<string>();

    /**
     * Returns a summary on actions that will be taken/not taken.
     */
    public get summary(): ImportCSVPreview {
        if (!this._preview) {
            this.updatePreview();
        }
        return this._preview;
    }

    public get importStepsObservable(): Observable<ImportStep[]> {
        return this._importingStepsSubject.asObservable();
    }

    public get leftReceivedHeaders(): string[] {
        return this._lostHeaders.received;
    }

    public get leftExpectedHeaders(): { [key: string]: string } {
        return this._lostHeaders.expected;
    }

    public get headerValues(): { [header: string]: string } {
        return this._mapReceivedExpectedHeaders;
    }

    public get rawFileObservable(): Observable<File> {
        return this._rawFileSubject.asObservable();
    }

    private get importModels(): ImportModel<ToCreate>[] {
        return Object.values(this._newEntries.value);
    }

    /**
     * BehaviorSubject for displaying a preview for the currently selected entries
     */
    private readonly _newEntries = new BehaviorSubject<{ [importTrackId: number]: ImportModel<ToCreate> }>({});

    /**
     * storing the summary preview for the import, to avoid recalculating it
     * at each display change.
     */
    private _preview: ImportCSVPreview;

    private _beforeImportHelper: { [key: string]: BeforeImportHandler } = {};
    private _afterImportHelper: { [key: string]: AfterImportHandler } = {};
    private _otherMainImportHelper: MainImportHandler[] = [];

    private _modelHeadersAndVerboseNames: { [key: string]: string };

    private _getDuplicatesFn: (entry: Partial<ToCreate>) => Partial<ToCreate>[] | Promise<Partial<ToCreate>[]>;

    protected readonly translate: TranslateService = this.importServiceCollector.translate;
    protected readonly matSnackbar: MatSnackBar = this.importServiceCollector.matSnackBar;

    /**
     * The last parsed file object (may be reparsed with new encoding, thus kept in memory)
     */
    private _rawFile: File;

    private _rawFileSubject = new BehaviorSubject<File>(null);

    /**
     * FileReader object for file import
     */
    private _reader = new FileReader();

    private _importingStepsSubject = new BehaviorSubject<ImportStep[]>([]);
    private _currentImportPhaseSubject = new BehaviorSubject<ImportStepPhase>(ImportStepPhase.ENQUEUED);
    private _isImportValidSubject = new BehaviorSubject<boolean>(false);

    /**
     * the list of parsed models that have been extracted from the opened file
     */
    private _csvLines: { [header: string]: string }[] = [];
    private _receivedHeaders: string[] = [];
    private _mapReceivedExpectedHeaders: { [expectedHeader: string]: string } = {};
    private _requiredFields: (keyof ToCreate)[] = [];
    private _lostHeaders: { expected: { [header: string]: string }; received: string[] } = {
        expected: {},
        received: []
    };

    private _selfImportHelper: MainImportHandler<ToCreate>;

    private readonly _papa: Papa = this.importServiceCollector.papa;

    /**
     * Constructor. Creates a fileReader to subscribe to it for incoming parsed
     * strings
     *
     * @param translate Translation service
     * @param papa External csv parser (ngx-papaparser)
     * @param matSnackBar snackBar to display import errors
     */
    public constructor(private importServiceCollector: ImportServiceCollector) {
        this._reader.onload = (event: FileReaderProgressEvent) => {
            this.parseInput(event.target.result as string);
        };
        this.init();
    }

    /**
     * Parses the data input. Expects a string as returned by via a File.readAsText() operation
     *
     * @param file
     */
    public parseInput(file: string): void {
        this.init();
        this.clearPreview();
        const papaConfig: ParseConfig = {
            header: true,
            skipEmptyLines: `greedy`,
            quoteChar: this.textSeparator
        };
        if (this.columnSeparator) {
            papaConfig.delimiter = this.columnSeparator;
        }
        const result = this._papa.parse(file, papaConfig);
        this._csvLines = result.data;
        this._receivedHeaders = Object.keys(this._csvLines[0]);
        const isValid = this.checkHeaderLength();
        this.checkReceivedHeaders();
        if (!isValid) {
            return;
        }
        this.propagateNextNewEntries();
        this.updateSummary();
    }

    public clearFile(): void {
        this.setParsedEntries({});
        this._rawFile = null;
        this._rawFileSubject.next(null);
    }

    /**
     * parses pre-prepared entries (e.g. from a textarea) instead of a csv structure
     *
     * @param entries: an array of prepared newEntry objects
     */
    public setParsedEntries(entries: { [importTrackId: number]: ImportModel<ToCreate> }): void {
        this.clearPreview();
        if (!entries) {
            return;
        }
        this.setNextEntries(entries);
    }

    /**
     * counts the amount of duplicates that have no decision on the action to
     * be taken
     */
    public updatePreview(): void {
        const summary = {
            total: 0,
            new: 0,
            duplicates: 0,
            errors: 0,
            done: 0
        };
        this.importModels.forEach(entry => {
            summary.total += 1;
            if (entry.status === `done`) {
                summary.done += 1;
                return;
            } else if (entry.status === `error` && !entry.hasDuplicates) {
                // errors that are not due to duplicates
                summary.errors += 1;
                return;
            } else if (entry.hasDuplicates) {
                summary.duplicates += 1;
                return;
            } else if (entry.status === `new`) {
                summary.new += 1;
            }
        });
        this._preview = summary;
    }

    public updateSummary(): void {
        this._importingStepsSubject.next([
            ...Object.values(this._beforeImportHelper),
            ...this.getAllMainImportHelpers(),
            ...Object.values(this._afterImportHelper)
        ]);
    }

    /**
     * a subscribable representation of the new items to be imported
     *
     * @returns an observable BehaviorSubject
     */
    public getNewEntriesObservable(): Observable<ImportModel<ToCreate>[]> {
        return this._newEntries.asObservable().pipe(map(value => Object.values(value)));
    }

    /**
     * Handler after a file was selected. Basic checking for type, then hand
     * over to parsing
     *
     * @param event type is Event, but has target.files, which typescript doesn't seem to recognize
     */
    public onSelectFile(event: any): void {
        if (event.target.files && event.target.files.length === 1) {
            this._rawFile = event.target.files[0];
            this._rawFileSubject.next(this._rawFile);
            this.readFile();
        }
    }

    /**
     * Rereads the (previously selected) file, if present. Thought to be triggered
     * by parameter changes on encoding, column, text separators
     */
    public refreshFile(): void {
        if (this._rawFile) {
            this.readFile();
        }
    }

    /**
     * Resets the data and preview (triggered upon selecting an invalid file)
     */
    public clearPreview(): void {
        Object.values(this._beforeImportHelper).forEach(helper => helper.doCleanup());
        Object.values(this._afterImportHelper).forEach(helper => helper.doCleanup());
        this.getAllMainImportHelpers().forEach(helper => helper.doCleanup());
        this.setNextEntries({});
        this._lostHeaders = { expected: {}, received: [] };
        this._preview = null;
        this._currentImportPhaseSubject.next(ImportStepPhase.ENQUEUED);
        this._isImportValidSubject.next(false);
    }

    /**
     * set a list of short names for error, indicating which column failed
     */
    private getVerboseError(error: string): string {
        return this.errorList[error] ?? error;
    }

    /**
     * Get an extended error description.
     *
     * @param error
     * @returns the extended error desription for that error
     */
    public verbose(error: string): string {
        return this.errorList[error] || error;
    }

    /**
     * Queries if a given error is present in the given entry
     *
     * @param entry the entry to check for the error.
     * @param error The error to check for
     * @returns true if the error is present
     */
    public hasError(entry: ImportModel<ToCreate>, error: string): boolean {
        return entry.errors.includes(error);
    }

    /**
     * Executing the import. Creates all secondary data, maps the newly created
     * secondary data to the new entries, then creates all entries without errors
     * by submitting them to the server. The entries will receive the status
     * 'done' on success.
     */
    public async doImport(): Promise<void> {
        this._currentImportPhaseSubject.next(ImportStepPhase.PENDING);
        await this.doBeforeImport();

        for (const handler of this.getAllMainImportHelpers()) {
            handler.phase = ImportStepPhase.PENDING;
            await handler.doImport();
            handler.phase = ImportStepPhase.FINISHED;
        }

        this.doAfterImport(this.importModels.map(importModel => importModel.model));

        this._currentImportPhaseSubject.next(ImportStepPhase.FINISHED);
        this.updatePreview();
    }

    private async doBeforeImport(): Promise<void> {
        for (const helper of Object.values(this._beforeImportHelper)) {
            if (helper.getModelsToCreateAmount() > 0) {
                await helper.doImport(this.importModels.map(entry => entry.newEntry));
            }
        }
    }

    private async doAfterImport(modelsToCreate: ToCreate[]): Promise<void> {
        for (const handler of Object.values(this._afterImportHelper)) {
            await handler.doImport(modelsToCreate);
        }
    }

    public setNewHeaderValue(updateMapReceivedExpectedHeaders: { [headerKey: string]: string }): void {
        for (const headerKey of Object.keys(updateMapReceivedExpectedHeaders)) {
            this._mapReceivedExpectedHeaders[headerKey] = updateMapReceivedExpectedHeaders[headerKey];
            delete this._lostHeaders.expected[headerKey];
            this.leftReceivedHeaders.splice(
                this.leftReceivedHeaders.findIndex(header => header === updateMapReceivedExpectedHeaders[headerKey]),
                1
            );
        }
        this.checkImportValidness();
        this.propagateNextNewEntries();
    }

    private setNextEntries(nextEntries: { [importTrackId: number]: ImportModel<ToCreate> }): void {
        this.getAllMainImportHelpers().forEach(helper => helper.pipeModels(Object.values(nextEntries)));
        this._newEntries.next(nextEntries);
        this.updatePreview();
    }

    /**
     * A helper function to specify import-helpers for `ToCreate`.
     * Should be overriden to specify the import-helpers.
     *
     * @returns A map containing import-helpers for specific attributes of `ToCreate`.
     */
    protected getBeforeImportHelpers(): { [key: string]: BeforeImportHandler<ToCreate, any> } {
        return {};
    }

    protected pipeParseValue(_value: string, _header: keyof ToCreate): any {}

    protected registerBeforeImportHelper<ToImport>(
        header: string,
        handler: StaticBeforeImportConfig<ToCreate, ToImport> | BaseBeforeImportHandler
    ): void {
        if (handler instanceof BaseBeforeImportHandler) {
            this._beforeImportHelper[header] = handler as any;
        } else {
            this._beforeImportHelper[header] = new StaticBeforeImportHandler(handler, key =>
                this.translate.instant(key)
            );
        }
    }

    protected registerAfterImportHandler<ToImport>(
        header: string,
        handler: StaticAfterImportConfig<ToCreate, ToImport> | BaseAfterImportHandler
    ): void {
        if (handler instanceof BaseAfterImportHandler) {
            this._afterImportHelper[header] = handler;
        } else {
            this._afterImportHelper[header] = new StaticAfterImportHandler<ToCreate, ToImport>(
                handler,
                header as keyof ToCreate
            );
        }
    }

    protected registerMainImportHandler(
        handler: StaticMainImportConfig<ToCreate> | BaseMainImportHandler<ToCreate>
    ): void {
        if (handler instanceof BaseMainImportHandler) {
            this._otherMainImportHelper.push(handler);
        } else {
            this._otherMainImportHelper.push(
                new StaticMainImportHandler({
                    resolveEntryFn: importModel => this.resolveEntry(importModel),
                    ...handler
                })
            );
        }
    }

    protected async onCreateImportModel({
        input,
        importTrackId
    }: {
        input: ToCreate;
        importTrackId: number;
    }): Promise<ImportModel<ToCreate>> {
        if (!this._getDuplicatesFn) {
            throw new Error(`No function to check for duplicates defined`);
        }
        const duplicates = await this._getDuplicatesFn(input);
        const hasDuplicates = duplicates.length > 0;
        const entry: ImportModel<ToCreate> = new ImportModel({
            model: input,
            hasDuplicates,
            importTrackId,
            duplicates
        });
        return entry;
    }

    /**
     * This function pipes received rows from a csv file already mapped to their internal used data structure.
     * This is done, before import models are created from those rows. Thus, this function facilitates to decide
     * how import models are created depending on the rows in the csv file.
     *
     * @param _entries
     */
    protected async onBeforeCreatingImportModels(_entries: ToCreate[]): Promise<void> {}

    private async createImportModel({
        input,
        importTrackId,
        errors
    }: {
        input: ToCreate;
        importTrackId: number;
        errors: string[];
    }): Promise<ImportModel<ToCreate>> {
        const nextEntry = await this.onCreateImportModel({ input, importTrackId });
        if (nextEntry.hasDuplicates) {
            errors.push(DUPLICATE_IMPORT_ERROR);
        }
        if (errors?.length) {
            nextEntry.errors = errors.map(error => this.getVerboseError(error));
            nextEntry.status = `error`;
        }
        return nextEntry;
    }

    /**
     * Maps the value in one csv line for every header to the header, which is later used for models that will be created or updated.
     * These headers are specified in `_mapReceivedExpectedHeader`.
     *
     * @param line a csv line
     *
     * @returns an object which has the headers of the models used internal
     */
    private createRawObject(line: CsvJsonMapping): { [key in keyof ToCreate]?: any } {
        return Object.keys(this._mapReceivedExpectedHeaders).mapToObject(expectedHeader => {
            const receivedHeader = this._mapReceivedExpectedHeaders[expectedHeader];
            return { [expectedHeader]: line[receivedHeader] };
        }) as { [key in keyof ToCreate]?: any };
    }

    /**
     * Maps incoming data of probably manual typed headers and values into headers, used by the rest of an import
     * process.
     *
     * @param line An incoming header <-> value map
     * @param importTrackId The number of an import object
     *
     * @returns A new model which values are linked to any helpers if needed.
     */
    private mapData(line: CsvJsonMapping): { model: ToCreate; errors: string[] } {
        const toCreate: ToCreate = {} as ToCreate;
        const errors = [];
        const rawObject = this.createRawObject(line);
        for (const expectedHeader of Object.keys(this._mapReceivedExpectedHeaders)) {
            const helper = this._beforeImportHelper[expectedHeader] || this._afterImportHelper[expectedHeader];
            const csvValue = rawObject[expectedHeader];
            try {
                const value = this.parseCsvValue(csvValue, {
                    header: expectedHeader as keyof ToCreate,
                    line: rawObject,
                    helper
                });
                toCreate[expectedHeader] = value;
            } catch (e) {
                console.debug(`Error while parsing ${expectedHeader}\n`, e);
                errors.push(e.message);
                toCreate[expectedHeader] = csvValue;
            }
        }
        return { model: toCreate, errors };
    }

    private init(): void {
        const config = this.getConfig();
        this.expectedHeaders = Object.keys(config.modelHeadersAndVerboseNames);
        this._modelHeadersAndVerboseNames = config.modelHeadersAndVerboseNames;
        this._getDuplicatesFn = config.getDuplicatesFn;
        this._requiredFields = config.requiredFields || [];
        this.initializeImportHelpers();
    }

    private getSelfImportHelper(): MainImportHandler<ToCreate> {
        return this._selfImportHelper;
    }

    private initializeImportHelpers(): void {
        const { createFn, updateFn, getDuplicatesFn, verboseNameFn, shouldBeCreatedFn } = this.getConfig();
        this._beforeImportHelper = { ...this._beforeImportHelper, ...this.getBeforeImportHelpers() };
        this._selfImportHelper = new StaticMainImportHandler({
            verboseNameFn,
            getDuplicatesFn,
            shouldBeCreatedFn,
            createFn,
            updateFn,
            resolveEntryFn: importModel => this.resolveEntry(importModel)
        });
        this.updateSummary();
    }

    private resolveEntry(entry: ImportModel<ToCreate>): ToCreate {
        let model = { ...entry.newEntry } as ToCreate;
        for (const key of Object.keys(this._beforeImportHelper)) {
            const helper = this._beforeImportHelper[key];
            const result = helper.doResolve(model, key);
            model = result.model;
            if (result.unresolvedModels) {
                entry.errors = (entry.errors ?? []).concat(this.getVerboseError(result.verboseName));
                this.updatePreview();
                break;
            }
        }
        return model;
    }

    private parseCsvValue<ToImport>(
        value: string,
        { header, line, helper }: { line: any; header: keyof ToCreate; helper?: ImportFind<ToImport> }
    ): any {
        if (helper) {
            return helper.findByName(value, line);
        }
        value = this.pipeParseValue(value, header) || value;
        return value;
    }

    /**
     * reads the _rawFile
     */
    private readFile(): void {
        this._reader.readAsText(this._rawFile, this.encoding);
    }

    /**
     * Checks the first line of the csv (the header) for consistency (length)
     *
     * @returns true if the line has at least the minimum amount of columns
     */
    private checkHeaderLength(): boolean {
        const snackbarDuration = 3000;
        if (this._receivedHeaders.length < this.requiredHeaderLength) {
            this.matSnackbar.open(this.translate.instant(`The file has too few columns to be parsed properly.`), ``, {
                duration: snackbarDuration
            });

            this.clearPreview();
            return false;
        } else if (this._receivedHeaders.length < this.expectedHeaders.length) {
            this.matSnackbar.open(
                this.translate.instant(`The file seems to have some ommitted columns. They will be considered empty.`),
                ``,
                { duration: snackbarDuration }
            );
        } else if (this._receivedHeaders.length > this.expectedHeaders.length) {
            this.matSnackbar.open(
                this.translate.instant(`The file seems to have additional columns. They will be ignored.`),
                ``,
                { duration: snackbarDuration }
            );
        }
        return true;
    }

    private checkReceivedHeaders(): void {
        const leftReceivedHeaders = [...this._receivedHeaders];
        const expectedHeaders = [...this.expectedHeaders];
        while (expectedHeaders.length > 0) {
            const toExpected = expectedHeaders.shift();
            const nextHeader = this._modelHeadersAndVerboseNames[toExpected];
            const nextHeaderTranslated = this.translate.instant(nextHeader);
            let index = leftReceivedHeaders.findIndex(header => header === nextHeaderTranslated);
            if (index > -1) {
                this._mapReceivedExpectedHeaders[toExpected] = nextHeaderTranslated;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            index = leftReceivedHeaders.findIndex(header => header === nextHeader);
            if (index > -1) {
                this._mapReceivedExpectedHeaders[toExpected] = nextHeader;
                leftReceivedHeaders.splice(index, 1);
                continue;
            }
            this._mapReceivedExpectedHeaders[toExpected] = toExpected;
            this._lostHeaders.expected[toExpected] = nextHeaderTranslated;
        }
        this._lostHeaders.received = leftReceivedHeaders;
        this.checkImportValidness();
    }

    private checkImportValidness(): void {
        this._isImportValidSubject.next(
            this._requiredFields.every(field => !Object.keys(this._lostHeaders.expected).includes(field as string))
        );
    }

    private async propagateNextNewEntries(): Promise<void> {
        const rawEntries: { model: ToCreate; errors: string[] }[] = [];
        for (let i = 0; i < this._csvLines.length; ++i) {
            const line = this._csvLines[i];
            rawEntries.push(this.mapData(line));
        }
        await this.onBeforeCreatingImportModels(rawEntries.map(entry => entry.model));
        for (let i = 0; i < rawEntries.length; ++i) {
            const { model, errors } = rawEntries[i];
            const nextEntry = await this.createImportModel({
                input: model,
                importTrackId: i + 1,
                errors
            });
            this.pushNextNewEntry(nextEntry);
        }
    }

    private pushNextNewEntry(nextEntry: ImportModel<ToCreate>): void {
        const oldEntries = this._newEntries.value;
        oldEntries[nextEntry.importTrackId] = nextEntry;
        this.setNextEntries(oldEntries);
    }

    private getAllMainImportHelpers(): MainImportHandler<ToCreate>[] {
        return [this.getSelfImportHelper(), ...this._otherMainImportHelper];
    }

    // Abstract methods
    public abstract downloadCsvExample(): void;
    protected abstract getConfig(): ImportConfig<ToCreate>;
}
